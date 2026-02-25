# RoadRulez — Project Overview

**RoadRulez** is a Next.js 14 (App Router, TypeScript) web application that helps travelers quickly look up traffic and driving rules for any country. Users can find speed limits, alcohol limits, equipment requirements, tolls, traffic signs, and regional variations — all in one place.

This wiki is your complete reference. Read it top to bottom once, then use it as a lookup when you forget how something works.

---

## Wiki Index

| Document | What it covers |
|----------|---------------|
| **[01-overview.md](./01-overview.md)** | This file — project purpose, tech stack, env vars |
| **[02-routing.md](./02-routing.md)** | URL structure, locale system, middleware |
| **[03-data-system.md](./03-data-system.md)** | Country JSON files, TypeScript types, how data flows |
| **[04-country-pages.md](./04-country-pages.md)** | Country detail page — all 11 modular components |
| **[05-admin-panel.md](./05-admin-panel.md)** | Admin panel — auth, RBAC, pages, API routes, workflow |
| **[06-how-to.md](./06-how-to.md)** | Step-by-step: add a country, add a language, deploy |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router, SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| Database (admin) | PostgreSQL via Neon (Prisma v7 ORM) |
| Auth (admin) | NextAuth.js v4, Credentials Provider, JWT sessions |
| Map | MapLibre GL JS (public transport tile layer) |
| Analytics | Plausible (server-side proxy, token never in browser) |
| Deployment | Vercel |
| Tests | Jest + ts-jest |

---

## Environment Variables

Create `x:\roadrulez\.env.local` with these values. **Never commit this file.**

```bash
# ──── Public Site ────────────────────────────────────────
# Controls whether the real site or "Coming Soon" is shown
ROADRULEZ_LAUNCH_MODE=LIVE          # set to LIVE to show real site, omit/other for Coming Soon

# ──── Database (admin panel only) ────────────────────────
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# ──── Authentication (admin panel only) ──────────────────
NEXTAUTH_SECRET=a-random-32-char-string
NEXTAUTH_URL=http://localhost:3000   # change to production URL when deployed

# ──── Analytics (optional) ───────────────────────────────
PLAUSIBLE_API_TOKEN=your-token
PLAUSIBLE_SITE_ID=roadrulez.com
```

---

## Quick Start (fresh machine)

```bash
cd x:\roadrulez
npm install
cp .env.example .env.local    # fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
npm run db:migrate            # run "init" when prompted
npx prisma db seed            # creates admin@roadrulez.com / admin123
npm run dev
```

Then open:
- Public site: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`
