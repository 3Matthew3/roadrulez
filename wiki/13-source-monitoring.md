# Source Monitoring & Reviews

RoadRulez monitors official source URLs for content changes. When a source changes, a **review task** is created — a human must approve or reject before rule data is updated.

**Core principle:** Sources changing does **not** automatically overwrite live rule data. Change detection → review → human decision.

---

## Architecture Overview

```
Daily Vercel Cron (03:00 UTC)
       ↓
GET /api/cron/source-check
       ↓
lib/source-check.ts → fetch URL, normalize, hash
       ↓
Hash unchanged? → SourceCheck status OK
Hash changed?   → SourceReview status OPEN + optional parser suggestions
       ↓
Admin reviews at /admin/source-reviews
       ↓
Approve → apply structured suggestion to CountryRule (if parser found one)
Reject  → acknowledge change, update hash, no DB rule change
```

---

## Data Model

### Extended `Source` (`prisma/schema.prisma`)

| Field | Purpose |
|-------|---------|
| `sourceType` | `GOVERNMENT`, `POLICE`, `MINISTRY`, `AUTOMOBILE_ASSOCIATION`, `LEGAL_DATABASE`, `SECONDARY` |
| `trustLevel` | `PRIMARY`, `TRUSTED_SECONDARY`, `UNVERIFIED` |
| `active` | Include in daily cron checks |
| `lastCheckedAt` | Last cron fetch time |
| `lastChangedAt` | Last detected content change |
| `contentHash` | SHA-256 of normalized page text |
| `checkStatus` | `OK`, `CHANGED`, `FAILED`, `NEEDS_REVIEW` |

### `SourceCheck`

One row per cron run per source: `oldHash`, `newHash`, `httpStatus`, `error`, `contentSnippet`, `diffSummary`.

### `SourceReview`

Created when content hash changes:

| Field | Purpose |
|-------|---------|
| `moduleKey` / `fieldName` | Which rule module might be affected |
| `currentValue` | Current DB value (JSON string or text) |
| `suggestedValue` | Parser output or change summary |
| `evidenceSnippet` | First 500 chars of normalized source text |
| `status` | `OPEN`, `APPROVED`, `REJECTED` |
| `reviewedById` / `reviewedAt` / `adminNote` | Human decision audit trail |

Migration: `prisma/migrations/20260527120000_source_monitoring/`

---

## Pattern Extraction (Stufe 2 — basic)

`lib/source-patterns.ts` scans changed source text for:

- **Speed limits** — `\d+ km/h` patterns → suggested `speed_limits` structuredValue
- **Alcohol limits** — `0.x‰` / BAC patterns → suggested `alcohol_limit`
- **IDP mentions** — text match → suggested `idpRequirement` on Country

On approve, `lib/source-review-service.ts` writes the suggestion to the matching `CountryRule` or `Country.idpRequirement` and creates an audit log entry.

> **Not yet implemented:** AI summaries (Stufe 3), PDF-specific parsing, email/Slack notifications.

---

## Cron Job (Vercel)

**Route:** `app/api/cron/source-check/route.ts`  
**Schedule:** `vercel.json` — daily at `0 3 * * *` (03:00 UTC)  
**Batch size:** 20 active sources per run (oldest `lastCheckedAt` first)

### Authentication

The route accepts requests when either:

- `Authorization: Bearer {CRON_SECRET}` header matches, or
- `x-vercel-cron: 1` header is present **and** `CRON_SECRET` is set in env

### Environment Variable

```bash
CRON_SECRET=your-random-secret   # openssl rand -hex 32
```

Set in Vercel → Project → Settings → Environment Variables (Production).

### Manual test

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/source-check
```

---

## Admin UI

| Page | Path | Purpose |
|------|------|---------|
| Sources list | `/admin/sources` | All sources with monitoring status |
| Source reviews | `/admin/source-reviews` | Approve/reject open changes |
| Country sources tab | `/admin/countries/[id]` → Sources | Add, edit, delete sources for one country |

Sidebar and public header show a badge count of open reviews (via `/api/admin/source-reviews/count`).

---

## Public Source Pages

| URL | Purpose |
|-----|---------|
| `/{lang}/sources` | All published sources across countries |
| `/{lang}/country/{iso2}/sources` | Sources for one country |

Country checklist card (`SourcesCard`) shows top sources with trust badges and links to the full page. Footer “Sources” link is active.

Rich source data comes from DB via `lib/countries.ts` → `source_entries[]`. JSON fallback countries still use plain `sources: string[]`.

---

## Key Files

| File | Role |
|------|------|
| `lib/source-check.ts` | Fetch, normalize, hash, cron job logic |
| `lib/source-patterns.ts` | Regex-based suggestion extraction |
| `lib/source-review-service.ts` | Apply approved reviews to DB |
| `lib/sources.ts` | Public source queries |
| `types/source.ts` | TypeScript types + label maps |
| `components/admin/source-form-dialog.tsx` | Add/edit source form |
| `__tests__/source-check.test.ts` | Unit tests for hash + parsers |

---

## Workflow: Adding a Monitored Source

1. Admin → Country → **Sources** tab → **Add source**
2. Fill URL, title, source type, trust level, optional module key
3. Enable **Active monitoring**
4. Publish country (still requires ≥1 source)
5. Cron runs daily — first run stores baseline hash; later runs detect changes

---

_Last updated: May 2026_
