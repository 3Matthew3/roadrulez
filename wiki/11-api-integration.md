# API Integration Guide

This page documents API routes in RoadRulez and how to integrate with them.

---

## Public API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/countries/search` | GET | Country search for homepage/map |
| `/api/countries/index` | GET | Country index data |

---

## Admin API Routes

All `/api/admin/*` routes require a valid JWT session with role **ADMIN** or **EDITOR** (unless noted). Unauthenticated requests return `401`.

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/countries` | GET, POST | List / create countries |
| `/api/admin/countries/[id]` | GET, PATCH, DELETE | Country detail (DELETE = ADMIN only) |
| `/api/admin/countries/[id]/publish` | POST | Publish validation + status change |
| `/api/admin/countries/[id]/inline-edit` | PATCH | Inline edits from public country page |
| `/api/admin/sources` | GET, POST | List / create sources |
| `/api/admin/sources/[id]` | PATCH, DELETE | Update / delete source |
| `/api/admin/source-reviews` | GET | List reviews (`?status=OPEN\|ALL`) |
| `/api/admin/source-reviews/count` | GET | Open review count |
| `/api/admin/source-reviews/[id]` | PATCH | Approve or reject review |
| `/api/admin/issues` | GET, PATCH | Issue inbox |
| `/api/admin/analytics` | GET | Plausible proxy (ADMIN only) |

### Example: Approve a source review

```bash
PATCH /api/admin/source-reviews/{id}
Content-Type: application/json

{
  "action": "approve",
  "adminNote": "Verified against StVO update"
}
```

Response includes `applyResult: { applied: true }` when rule data was written.

---

## Cron API

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/cron/source-check` | GET | `Bearer {CRON_SECRET}` or Vercel cron header | Run source monitoring batch |

See **[13-source-monitoring.md](./13-source-monitoring.md)**.

---

## Auth API

| Route | Purpose |
|-------|---------|
| `/api/auth/[...nextauth]` | NextAuth.js — login, session, signout |

---

## Error Handling Conventions

- `401` — not logged in
- `403` — insufficient role
- `404` — entity not found
- `409` — conflict (e.g. review already closed)
- `422` — validation failed (publish checklist)

---

_Last updated: May 2026_
