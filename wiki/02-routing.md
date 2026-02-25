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

All public pages live under `app/[lang]/`. The `[lang]` segment is either `en` or `de`.

### URL Map

| URL | File | Description |
|-----|------|-------------|
| `/en` or `/de` | `app/[lang]/page.tsx` | Home — Coming Soon OR real homepage depending on `ROADRULEZ_LAUNCH_MODE` |
| `/en/country/germany` | `app/[lang]/country/[name]/page.tsx` | Country detail page |
| `/en/map` | `app/[lang]/map/page.tsx` | Interactive public transport map |
| `/en/search` | `app/[lang]/search/page.tsx` | Country search results |
| `/en/beta` | `app/[lang]/beta/page.tsx` | Hidden beta access (same as real homepage) |
| `/en/impressum` | `app/[lang]/impressum/page.tsx` | Legal imprint page |

### How Locale Detection Works (`middleware.ts`)

1. If the URL already has `/en/` or `/de/` — pass it through.
2. If no locale prefix:
   a. Check the `NEXT_LOCALE` cookie (set by the language switcher).
   b. Fall back to the browser's `Accept-Language` header (`de` → German, everything else → English).
   c. Redirect to `/{detected-locale}/...`.

### Supported Locales

Defined at the top of `middleware.ts`:
```ts
const locales = ["en", "de"]
const defaultLocale = "en"
```

To add a new language (e.g. French), add `"fr"` to this array and create `data/dictionaries/fr.json`.

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
| `/admin/issues` | `app/admin/issues/page.tsx` | EDITOR + ADMIN |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | ADMIN only |

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
| `/api/auth/[...nextauth]` | NextAuth.js authentication endpoints (login, session, signout) |
| `/api/admin/countries` | List + create countries |
| `/api/admin/countries/[id]` | Read, update, delete one country |
| `/api/admin/countries/[id]/publish` | Run publish validation + transition to PUBLISHED |
| `/api/admin/issues` | List + update issue reports |
| `/api/admin/analytics` | Proxy to Plausible (server-side, admin only) |

---

## Layout Hierarchy

```
app/[lang]/layout.tsx           ← ThemeProvider, SiteHeader, SiteFooter (public)
└── app/[lang]/page.tsx         ← Home
└── app/[lang]/country/[name]/page.tsx  ← Country detail

app/admin/layout.tsx            ← dark theme, AdminSidebar, SessionProvider (admin)
└── app/admin/page.tsx          ← Dashboard
```

The two layouts are completely independent — the admin panel has its own `<html>` and `<body>` tags forced to dark mode.
