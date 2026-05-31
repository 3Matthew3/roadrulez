# Data System

RoadRulez uses **two data layers** that work together:

1. **PostgreSQL (Prisma)** — source of truth for countries managed in the admin panel (rules, sources, reviews)
2. **JSON files** in `data/countries/` — fallback for countries not yet in the DB, plus locale variants

`lib/countries.ts` tries the database first, then falls back to JSON.

---

## Part 1: JSON Country Files (Public Site)

### File Locations

```
data/
├── countries/
│   ├── index.json       ← List of all countries (for search + homepage)
│   ├── de.json          ← Germany (English content)
│   ├── de.de.json       ← Germany (German content — optional locale variant)
│   ├── jp.json          ← Japan (English)
│   ├── jp.de.json       ← Japan (German)
│   ├── us.json          ← United States
│   ├── fr.json          ← France
│   ├── it.json          ← Italy
│   ├── es.json          ← Spain
│   ├── au.json          ← Australia
│   ├── ca.json          ← Canada
│   ├── ae.json          ← United Arab Emirates
│   ├── th.json          ← Thailand
│   ├── kr.json          ← South Korea
│   └── za.json          ← South Africa
└── dictionaries/
    ├── en.json          ← UI labels (English)
    ├── de.json          ← UI labels (German)
    ├── es.json          ← UI labels (Spanish)
    └── ja.json          ← UI labels (Japanese)
```

### How Locale Variants Work

When a user visits in German (`/de/country/japan`), the app tries to load `jp.de.json` first. If it doesn't exist, it falls back to `jp.json`. This means you can have fully localized content without needing to translate every country.

Pattern: `{iso2}.{lang}.json` (e.g. `jp.de.json` for Japan in German)

### `index.json` — Country Index

Used by the homepage and search to list all countries without loading every full JSON. Format:

```json
[
  {
    "name": "Germany",
    "names": { "en": "Germany", "de": "Deutschland" },
    "iso2": "DE",
    "flag": "🇩🇪"
  }
]
```

---

## Part 2: TypeScript Data Schema (`types/country.ts`)

Every country JSON file must match the `CountryData` interface exactly. TypeScript will error at build time if something is wrong.

### Full `CountryData` Shape

```ts
interface CountryData {
  // ── Identification ─────────────────────────────────────
  name_en:       string        // "Germany"
  name_local:    string        // "Deutschland"
  iso2:          string        // "DE"
  iso3:          string        // "DEU"
  continent:     string        // "Europe"
  flag:          string        // "🇩🇪" or "/flags/de.png"
  drive_side:    "left" | "right"
  header_images?: string[]     // paths to hero images

  // ── Rules (nationwide defaults) ────────────────────────
  rules: TrafficRules

  // ── Vehicle-specific overrides ─────────────────────────
  vehicles?: {
    car?:        Partial<VehicleRules>
    motorcycle?: Partial<VehicleRules>
    moped?:      Partial<VehicleRules>
  }

  // ── Text fields ────────────────────────────────────────
  summary:           string      // 2-3 sentence overview shown in QuickSummary
  common_traps:      string[]    // "Did you know?" gotchas for travelers
  idp_requirement?:  string      // International Driving Permit notes
  rental_and_idp_notes: string

  // ── Regional variations ────────────────────────────────
  regional_variations?: RegionalVariation[]

  // ── Metadata ───────────────────────────────────────────
  last_verified: string          // "2024-01-15"
  status:        "sample" | "verified" | "needs_review"
  data_coverage?: "high" | "medium" | "low"
  sources:       string[]        // URLs/titles (legacy JSON + fallback)
  source_entries?: CountrySourceEntry[]  // Rich sources from DB (see types/source.ts)

  // ── Visuals ────────────────────────────────────────────
  road_signs?: RoadSign[]
}
```

### `TrafficRules` — The Core Rules Object

```ts
interface TrafficRules {
  speed_limits: {
    urban:     number      // km/h (or mph — check units field)
    rural:     number
    motorway:  number
    units:     "km/h" | "mph"
    notes?:    string      // "130 in good conditions, 110 in rain"
  }
  alcohol_limit: {
    value: number          // 0.5 = 0.5‰ BAC
    unit:  "‰" | "BAC"
    notes?: string
  }
  seatbelt_rules:        string
  child_seat_rules:      string
  phone_usage_rules:     string
  headlights_rules:      string
  priority_rules:        string
  tolls: {
    required: boolean
    type:     string       // "vignette" | "toll booth" | "electronic" | "mixed" | "none"
    notes?:   string
  }
  parking_rules:         string
  mandatory_equipment:   string[]  // ["reflective vest", "first aid kit", "fire extinguisher"]
  winter_rules:          string
  emergency_numbers:     string[]  // ["112", "110"]
}
```

### `RegionalVariation` — State/Province Overrides

```ts
interface RegionalVariation {
  region_type: "state" | "province" | "city"
  region_name: string       // "Bavaria"
  region_code?: string      // "BY"
  differences:  Partial<TrafficRules>  // Only the rules that differ from national!
  notes?:       string
}
```

### Vehicle Type Override Logic (in `country/[name]/page.tsx`)

When a user selects "motorcycle" via `?vehicle=motorcycle` in the URL:

```ts
const vehicleOverrides = data.vehicles?.motorcycle || {}
const rules = {
  ...data.rules,               // start with national defaults
  ...vehicleOverrides,          // overlay vehicle-specific overrides
  speed_limits: {
    ...data.rules.speed_limits,
    ...(vehicleOverrides.speed_limits || {})
  }
}
```

The merged `rules` object is then passed down to all modular components.

---

## Part 3: Database Schema (Admin + Public when DB available)

### Models

| Model | Purpose |
|-------|---------|
| `User` | Admin/editor accounts with roles |
| `Country` | Country records with status (DRAFT/VERIFIED/PUBLISHED) |
| `Region` | Sub-regions of a country with rule overrides |
| `RuleModule` | Lookup table for rule categories (speed_limits, tolls, etc.) |
| `CountryRule` | A single rule value for a country + module combination |
| `RegionRuleOverride` | A rule override at the region level |
| `Source` | Official references — type, trust level, monitoring fields |
| `SourceCheck` | Log of each automated URL check (hash, HTTP status, snippet) |
| `SourceReview` | Human review queue when a source changes |
| `IssueReport` | User-submitted feedback/errors |
| `AuditLog` | Complete history of every change (who, what, when) |
| `LoginAttempt` | Brute-force protection for admin login |

### `Source` (extended)

Beyond title/url/publisher, sources now include:

- `sourceType`, `trustLevel`, `active`
- `contentHash`, `lastCheckedAt`, `lastChangedAt`, `checkStatus`
- Optional links: `countryId`, `regionId`, `moduleKey`

See **[13-source-monitoring.md](./13-source-monitoring.md)** for the full monitoring workflow.

See `prisma/schema.prisma` for column definitions.

---

## Reading Data (lib/countries.ts)

```ts
// Get all countries for the index/search (DB + JSON merge)
const countries = await getAllCountries()

// Get one country — DB first, JSON fallback
const data = await getCountryData("DE", "de")
// → includes source_entries[] when loaded from DB
```

Public source listing: `lib/sources.ts` (`getAllPublicSources`, `getSourcesForCountry`).

## Reading Translations (lib/dictionaries.ts)

```ts
const dict = await getDictionary("de")
// → parses data/dictionaries/de.json
// All UI labels for the page (button text, aria labels, etc.)
```
