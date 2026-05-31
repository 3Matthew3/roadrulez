# How-To Guides

Common tasks you'll do as the project owner.

---

## How to Add a New Country (Public Site)

The public site reads directly from JSON files. No database needed.

### Step 1 — Create the JSON file

Create `data/countries/{iso2}.json` (lowercase ISO2 code). Copy an existing file as a template:

```bash
copy data\countries\de.json data\countries\pt.json
```

Fill in all the required fields. Minimum required fields:

```json
{
  "name_en": "Portugal",
  "name_local": "Portugal",
  "iso2": "PT",
  "iso3": "PRT",
  "continent": "Europe",
  "flag": "🇵🇹",
  "drive_side": "right",
  "rules": {
    "speed_limits": { "urban": 50, "rural": 90, "motorway": 120, "units": "km/h" },
    "alcohol_limit": { "value": 0.5, "unit": "‰" },
    "seatbelt_rules": "Mandatory for all passengers",
    "child_seat_rules": "Under 135cm must use approved seat",
    "phone_usage_rules": "Handheld forbidden",
    "headlights_rules": "Daytime running lights recommended",
    "priority_rules": "Right-hand priority at unmarked intersections",
    "tolls": { "required": true, "type": "electronic", "notes": "Via Verde system" },
    "parking_rules": "Blue zones require ticket",
    "mandatory_equipment": ["reflective vest", "warning triangle", "first aid kit"],
    "winter_rules": "No mandatory snow tyres",
    "emergency_numbers": ["112"]
  },
  "summary": "Portugal drives on the right. Speed limits are strictly enforced by cameras.",
  "common_traps": ["Speed cameras on motorways", "Vignette required on some roads"],
  "rental_and_idp_notes": "No IDP required for EU licence holders.",
  "last_verified": "2025-01-01",
  "status": "sample",
  "sources": ["https://ec.europa.eu/transport/road_safety/going_abroad/portugal_en"]
}
```

### Step 2 — Add to the country index

Open `data/countries/index.json` and add an entry:

```json
{
  "name": "Portugal",
  "names": { "en": "Portugal", "de": "Portugal" },
  "iso2": "PT",
  "flag": "🇵🇹"
}
```

### Step 3 — (Optional) Create a German version

Create `data/countries/pt.de.json` with all text fields translated to German. Only include fields that differ from the English version — it will inherit everything else from `pt.json`.

Actually: the German JSON usually has ALL the same fields but with German text. Copy the whole file and translate `summary`, `common_traps`, `rental_and_idp_notes`, and any `notes` fields.

### Step 4 — Test it

```bash
npm run dev
```

Go to `http://localhost:3000/en/country/portugal` — the page should load. Check German at `/de/country/portugal`.

---

## How to Add a New Language

Currently: `en` and `de` are supported. To add `fr` (French):

### Step 1 — Add to middleware

`middleware.ts`, line 5:
```ts
const locales = ["en", "de", "fr"]  // add "fr"
```

### Step 2 — Create the dictionary

Copy `data/dictionaries/de.json` → `data/dictionaries/fr.json` and translate all values.

### Step 3 — Add country name translations

For each country in `data/countries/index.json`, add the French name:
```json
{ "names": { "en": "Germany", "de": "Deutschland", "fr": "Allemagne" } }
```

### Step 4 — Create locale JSON files (optional)

Create `data/countries/de.fr.json` for countries you want fully localized in French. Otherwise they fall back to English content.

### Step 5 — Update the language switcher

The language switcher component is in `components/main-nav.tsx`. Add `{ code: "fr", label: "Français" }` to the options array.

---

## How to Update an Existing Country

1. Open `data/countries/{iso2}.json` directly in your editor.
2. Edit the values.
3. Update `last_verified` to today's date.
4. Change `status` from `"sample"` to `"verified"` when you're confident in the data.
5. Save. The change is live immediately on next page load (no deploy needed in dev).

---

## How to Deploy to Vercel

### First Deploy

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Add all environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel domain, e.g. `https://roadrulez.vercel.app`)
   - `ROADRULEZ_LAUNCH_MODE` = `LIVE`
   - `CRON_SECRET` (for daily source monitoring — see below)
   - `PLAUSIBLE_API_TOKEN` (optional)
   - `PLAUSIBLE_SITE_ID` (optional)
4. Deploy.
5. After deploy, run migrations:
   ```bash
   npx prisma migrate deploy
   ```
6. Confirm cron job appears under Vercel → Settings → Cron Jobs (`/api/cron/source-check`).

### Subsequent Deploys

Just push to `main`. Vercel auto-deploys. If you changed `schema.prisma`, run `npx prisma migrate deploy` after deploying.

---

## How to Change the Coming Soon / Live Toggle

In `.env.local` (local) or Vercel environment variables (production):

```bash
# Show Coming Soon page:
# ROADRULEZ_LAUNCH_MODE=anything-else-or-omit-it

# Show real homepage:
ROADRULEZ_LAUNCH_MODE=LIVE
```

No code change or redeploy needed — just update the env var and redeploy (Vercel) or restart dev server (local).

---

## How to Run Tests

```bash
npm test
```

Two test files:
- `__tests__/rbac.test.ts` — tests that ADMIN/EDITOR/REVIEWER roles get correct access
- `__tests__/publish-validation.test.ts` — tests that publish blocks correctly when fields are missing
- `__tests__/source-check.test.ts` — source hash normalization + pattern extraction
- `__tests__/country-inline-edit-fields.test.ts` — inline edit field config
- `__tests__/rate-limit.test.ts` — login rate limiting

---

## How to Open Prisma Studio (Database Browser)

```bash
npm run db:studio
```

Opens at `http://localhost:5555`. Visual table browser — useful for checking seed data or debugging.

---

## How to Reset the Database

⚠️ **Deletes all data:**
```bash
npx prisma migrate reset
# then re-seed:
npx prisma db seed
```

---

## How to Add a New Admin User

The seed script only runs once. To add more users, either:

**Option A — Prisma Studio:**
1. `npm run db:studio`
2. Open the `users` table
3. Create a row — but you need a bcrypt hash for the password.

**Option B — Run a script:**
```ts
// scripts/create-user.ts
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const hash = await bcrypt.hash("yourpassword", 12)
await prisma.user.create({
  data: {
    email: "newuser@roadrulez.com",
    name: "New User",
    passwordHash: hash,
    role: "EDITOR",
  }
})
```

Run: `ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-user.ts`

---

## How to Add a Plausible Custom Event

To track country views (for the analytics page's "Top Country Views" chart), fire an event from the country page:

```html
<!-- In app/[lang]/layout.tsx head -->
<script defer data-domain="roadrulez.com" src="https://plausible.io/js/script.js"></script>
```

Then in a client component on the country page:
```ts
window.plausible?.("country_view", { props: { country_code: "DE" } })
```

The admin analytics page filters Plausible events for `country_view` to populate the country views chart.

---

## How to Add and Monitor a Source

1. Log in as ADMIN or EDITOR.
2. Go to **Admin → Countries → [country] → Sources tab**.
3. Click **Add source** — fill title, URL, source type, trust level, optional module.
4. Enable **Active monitoring** so the daily cron includes this URL.
5. Publish the country when ready (≥1 source required).

When the cron detects a content change, a review appears at **Admin → Source Reviews**. Approve to apply parser suggestions to country rules, or reject to acknowledge without changes.

Full details: **[13-source-monitoring.md](./13-source-monitoring.md)**

### Cron setup (production)

1. Set `CRON_SECRET` in Vercel env vars (same value locally in `.env.local` for manual tests).
2. `vercel.json` already defines the schedule (`0 3 * * *`).
3. Test manually:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-domain.com/api/cron/source-check
   ```
