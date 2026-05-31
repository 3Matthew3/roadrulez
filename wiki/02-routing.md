# Routing & URL Structure

RoadRulez has two completely separate routing trees that never overlap.

---

## The Two Routing Trees

```
/                       ← root (redirected to locale)
├── /en/...             ← Public site (English)
├── /de/...             ← Public site (German)
└── /admin/...          ← Admin panel (English only, JWT-protected)
```

---

## Public Site — Locale Routing

All public pages live under `app/[lang]/`. The `[lang]` segment is `en`, `de`, `es`, or `ja` (see `lib/constants.ts`).

### URL Map

| URL | File | Description |
|-----|------|-------------|
| `/en` or `/de` | `app/[lang]/page.tsx` | Home — Coming Soon OR real homepage depending on `ROADRULEZ_LAUNCH_MODE` |
| `/en/country/de` | `app/[lang]/country/[code]/page.tsx` | Country detail (ISO2 code, case-insensitive) |
| `/en/country/de/sources` | `app/[lang]/country/[code]/sources/page.tsx` | Official sources for one country |
| `/en/sources` | `app/[lang]/sources/page.tsx` | Global sources index |
| `/en/map` | `app/[lang]/map/page.tsx` | Interactive public transport map |
| `/en/search` | `app/[lang]/search/page.tsx` | Country search results |
| `/en/beta` | `app/[lang]/beta/page.tsx` | Hidden beta access (same as real homepage) |
| `/en/impressum` | `app/[lang]/impressum/page.tsx` | Legal imprint page |

### How Locale Detection Works (`middleware.ts`)

1. If the URL already has a supported locale prefix — pass it through.
2. If no locale prefix:
   a. Check the `NEXT_LOCALE` cookie (set by the language switcher).
   b. Fall back to the browser's `Accept-Language` header.
   c. Redirect to `/{detected-locale}/...`.

Duplicate locale prefixes (e.g. `/de/de/country/de`) are normalized automatically.

### Supported Locales

Defined in `lib/constants.ts`:

```ts
export const SUPPORTED_LOCALES = ["en", "de", "es", "ja"] as const
export const DEFAULT_LOCALE = "en"
```

To add a new language, update `SUPPORTED_LOCALES`, create `data/dictionaries/{lang}.json`, and add options to the language switcher.

---

## Switching Between Coming Soon and Real Site

`app/[lang]/page.tsx` checks an environment variable:

```ts
const isLive = process.env.ROADRULEZ_LAUNCH_MODE === "LIVE"
if (isLive) return <RealHomePage />
return <ComingSoonPage />
```

- **Coming Soon mode** (default): The animated Coming Soon page. No country links visible.
- **Live mode**: The full homepage with hero search, popular countries, feature list.

Set `ROADRULEZ_LAUNCH_MODE=LIVE` in `.env.local` to switch.

---

## Admin Panel — `/admin` Tree

| URL | File | Who can access |
|-----|------|----------------|
| `/admin/login` | `app/admin/login/page.tsx` | Anyone (not protected) |
| `/admin` | `app/admin/page.tsx` | EDITOR + ADMIN |
| `/admin/countries` | `app/admin/countries/page.tsx` | EDITOR + ADMIN |
| `/admin/countries/[id]` | `app/admin/countries/[id]/page.tsx` | EDITOR + ADMIN |
| `/admin/sources` | `app/admin/sources/page.tsx` | EDITOR + ADMIN |
| `/admin/source-reviews` | `app/admin/source-reviews/page.tsx` | EDITOR + ADMIN |
| `/admin/issues` | `app/admin/issues/page.tsx` | EDITOR + ADMIN |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | ADMIN only |

### Staff session on the public site

When logged in as ADMIN or EDITOR, the public header shows an avatar menu (dashboard link, source reviews, sign out). The admin layout sidebar is separate; login defaults to the homepage (`/en`), not `/admin`.

See **[13-source-monitoring.md](./13-source-monitoring.md)** for the source review workflow.

### How Admin Protection Works

`middleware.ts` intercepts every `/admin/*` request:
1. If path is `/admin/login` or `/api/auth/*` — allow through.
2. Otherwise call `getToken()` (reads the NextAuth JWT cookie).
3. If no token → redirect to `/admin/login?callbackUrl=...`.
4. If token exists → allow through. Fine-grained role checks happen inside each page/API route.

---

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/auth/[...nextauth]` | NextAuth.js authentication endpoints |
| `/api/admin/countries` | List + create countries |
| `/api/admin/countries/[id]` | Read, update, delete one country |
| `/api/admin/countries/[id]/publish` | Publish validation + transition to PUBLISHED |
| `/api/admin/countries/[id]/inline-edit` | Inline rule edits from public country pages (ADMIN) |
| `/api/admin/sources` | List + create sources |
| `/api/admin/sources/[id]` | Update + delete one source |
| `/api/admin/source-reviews` | List source reviews |
| `/api/admin/source-reviews/count` | Open review count (sidebar badge) |
| `/api/admin/source-reviews/[id]` | Approve or reject a review |
| `/api/admin/issues` | List + update issue reports |
| `/api/admin/analytics` | Plausible proxy (ADMIN only) |
| `/api/cron/source-check` | Daily source monitoring job (CRON_SECRET) |
| `/api/countries/search` | Public country search |

---

## Layout Hierarchy

```
app/[lang]/layout.tsx           ← ThemeProvider, SiteHeader (+ staff session), SiteFooter
└── app/[lang]/page.tsx         ← Home
└── app/[lang]/country/[code]/page.tsx
└── app/[lang]/country/[code]/sources/page.tsx
└── app/[lang]/sources/page.tsx

app/admin/layout.tsx            ← dark theme, AdminSidebar, SessionProvider (admin)
└── app/admin/page.tsx          ← Dashboard
```

The two layouts are completely independent — the admin panel has its own `<html>` and `<body>` tags forced to dark mode.
