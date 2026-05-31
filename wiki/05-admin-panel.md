# Admin Panel

The admin panel lives at `/admin`. It's a completely separate section of the app — English-only, dark theme, JWT-protected. It's for the RoadRulez team to manage country content, review user-reported issues, and monitor analytics.

---

## Accessing the Admin Panel

**URL:** `http://localhost:3000/admin` (or your production domain)

Default accounts after seeding (`npx prisma db seed`):

| Email | Password | Role |
|-------|----------|------|
| `admin@roadrulez.com` | `admin123` | ADMIN |
| `editor@roadrulez.com` | `editor123` | EDITOR |

> **Change these passwords immediately after first login in production.**

---

## Authentication

- **Provider:** NextAuth.js v4, Credentials (email + bcrypt password)
- **Session type:** JWT cookie (4-hour lifetime)
- **Login page:** `app/admin/login/page.tsx`
- **Config:** `lib/auth.ts` (`authOptions`)

After login from `/admin/login`, users are redirected to the **public homepage** (`/en` by default). Protected admin URLs still use `callbackUrl` to return to the intended page.

The middleware reads the JWT on every request to `/admin/*`. If missing → redirect to `/admin/login?callbackUrl=...`.

**Public site:** Logged-in ADMIN/EDITOR users see a header avatar menu (`components/admin-session-indicator.tsx`) with links to the dashboard and source reviews.

---

## Roles (RBAC)

| Role | Can do |
|------|--------|
| **ADMIN** | Everything: analytics, delete countries, manage users |
| **EDITOR** | Create/edit/publish countries, manage issues, view dashboard |
| **REVIEWER** | Read-only (future use — currently not enforced in UI) |

### How Role Checks Work (in API Routes)

```ts
// Allow EDITOR + ADMIN
export async function GET(req) {
  return withEditorAuth(async (session) => {
    // session.user.role is available here
    ...
  })
}

// Allow ADMIN only
export async function DELETE(req, { params }) {
  return withAdminAuth(async (session) => {
    ...
  })
}
```

These wrappers are defined in `lib/auth.ts`. They return `401` automatically if the role is insufficient.

---

## Pages

### Dashboard (`/admin`)
Quick overview of the content state:
- **4 stat cards:** Total countries, needs attention, open issues, published coverage %
- **Recent activity:** Last 8 audit log entries (who changed what and when)
- **Open issues:** Top 5 highest-priority unresolved reports
- **Quick links:** Countries, Source Reviews (with open count), Issues, Analytics

### Sources (`/admin/sources`)
Global list of all sources with monitoring status (active, checkStatus, trust level, last checked). Links to country detail and source reviews.

### Source Reviews (`/admin/source-reviews`)
Queue of detected source changes. Admins can **Approve & apply** (writes parser suggestions to country rules) or **Reject** (acknowledge without rule change). See **[13-source-monitoring.md](./13-source-monitoring.md)**.

Sidebar shows a badge with the open review count.

### Countries List (`/admin/countries`)
Searchable, filterable table of all countries in the database.
- Filter by: status (DRAFT / VERIFIED / PUBLISHED), driving side
- Search by: name or ISO2 code
- Columns: flag, name, ISO2, status, driving side, content (rules/sources/issues count), last verified date
- Click any row → opens Country Detail

### Country Detail (`/admin/countries/[id]`)
5-tab editing interface for a single country:

| Tab | What you edit |
|-----|--------------|
| **Overview** | Name, flag emoji, driving side, status, summary text |
| **Rules** | Read-only view of structured rule JSON per module |
| **Regions** | Regions with their national-overriding rules (OVERRIDES NATIONAL badge) |
| **Sources** | Add/edit/delete sources; set type, trust level, active monitoring |
| **Changelog** | Full audit log for this country — every save, publish, status change |

Use **Add source** on the Sources tab before publishing. At least one source is required.

**Publish button:** Validates the country before making it live (see Workflow below).

### Issues Inbox (`/admin/issues`)
User-submitted feedback/error reports sorted by priority.
- Filter by: status, priority
- Each card shows: priority badge, status, category, message, country, submission date
- Expand a card → inline dropdowns to change status or priority (saves immediately)
- Left border colour: red = CRITICAL/HIGH, neutral = others

### Analytics (`/admin/analytics`)
Plausible data proxied through the server (token never exposed to browser).
- 4 KPI cards (7d / 30d): unique visitors, page views, visits, bounce rate
- Line chart: pageviews + visitors over 30 days
- Top country views (custom `country_view` Plausible event)
- Visitor geography
- Top pages by pageviews
- Top referrers

**Note:** If `PLAUSIBLE_API_TOKEN` is not set, the page shows an empty state, not an error.

---

## API Routes

### `GET /api/admin/countries`
Returns paginated country list. Query params: `search`, `status`, `drivingSide`, `page`, `limit`.

### `POST /api/admin/countries`
Creates a new country. Body: `{ name, iso2, flag?, drivingSide?, summary? }`.

### `GET /api/admin/countries/[id]`
Returns full country detail including rules, regions, sources, issues (last 20), audit log (last 50).

### `PATCH /api/admin/countries/[id]`
Updates country fields. Body is partial — only include fields you want to change.

### `DELETE /api/admin/countries/[id]`
**ADMIN only.** Permanently deletes a country and all its rules/regions/sources (cascades).

### `POST /api/admin/countries/[id]/publish`
Runs publish validation. Returns `422` with `details[]` if validation fails. On success, sets `status = PUBLISHED`, records audit log.

### `PATCH /api/admin/countries/[id]/inline-edit`
Inline field updates from the public country page (ADMIN, EN, car view).

### `GET/POST /api/admin/sources`
List all sources / create a new source (link to country, set monitoring fields).

### `PATCH/DELETE /api/admin/sources/[id]`
Update or delete one source.

### `GET /api/admin/source-reviews`
List reviews. Query: `status=OPEN|ALL`.

### `GET /api/admin/source-reviews/count`
Returns `{ count }` of open reviews (sidebar + header badge).

### `PATCH /api/admin/source-reviews/[id]`
Body: `{ action: "approve" | "reject", adminNote? }`. On approve, applies structured suggestions when available.

**Publish checklist:**
- ✅ Name not empty
- ✅ ISO2 code not empty
- ✅ Summary text not empty
- ✅ At least one source added

### `GET /api/admin/issues`
Returns paginated issue list. Query params: `status`, `priority`, `countryId`, `page`, `limit`.

### `PATCH /api/admin/issues`
Updates a single issue's `status` or `priority`. Body: `{ id, status?, priority? }`.

### `GET /api/admin/analytics`
**ADMIN only.** Fetches from Plausible API and returns combined analytics payload. Token stays server-side.

---

## Content Workflow (Draft → Published)

```
Create country (status = DRAFT)
       ↓
Edit metadata, rules, regions
       ↓
Add at least one source
       ↓
Fill in summary text
       ↓
Click "Publish" → validation check
  FAIL → modal shows list of errors to fix
  PASS → status = PUBLISHED, audit log entry created
```

Every save, status change, and publish records an `AuditLog` entry with:
- Who did it (actorUserId)
- What changed (beforeValue / afterValue as JSON)
- When (createdAt timestamp)
- Optional note (publish note text)

---

## Audit Log (`lib/audit.ts`)

```ts
await createAuditLog({
  actorUserId: session.user.id,
  entityType:  "country",
  entityId:    country.id,
  action:      "publish",          // create | update | delete | publish | verify
  beforeValue: { status: "DRAFT" },
  afterValue:  { status: "PUBLISHED" },
  note:        "Verified by ADAC sources",
})
```

---

## Database Setup

Connection via `DATABASE_URL` in `.env.local` / Vercel env vars.

Commands:
```bash
npm run db:migrate     # create/update tables (run after schema changes)
npm run db:seed        # insert initial data
npm run db:studio      # visual DB browser at localhost:5555
```

After deploying schema changes to production:
```bash
npx prisma migrate deploy
```
