# Data System

RoadRulez uses **two separate data systems** that work together:

1. **JSON files** in `data/countries/` — the actual driving rules for the public site (no database needed)
2. **PostgreSQL database** (via Prisma) — used only by the admin panel for content management

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
    └── de.json          ← UI labels (German)
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
  sources:       string[]        // URLs to official sources

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

## Part 3: Database Schema (Admin Panel Only)

The PostgreSQL database is only used by the admin panel. The public site reads from JSON files directly. The admin panel is the **editing interface** — when changes are ready for the public, editors export/update the JSON files.

### Models

| Model | Purpose |
|-------|---------|
| `User` | Admin/editor accounts with roles |
| `Country` | Country records with status (DRAFT/VERIFIED/PUBLISHED) |
| `Region` | Sub-regions of a country with rule overrides |
| `RuleModule` | Lookup table for rule categories (speed_limits, tolls, etc.) |
| `CountryRule` | A single rule value for a country + module combination |
| `RegionRuleOverride` | A rule override at the region level |
| `Source` | Official sources linked to a country (required before publishing) |
| `IssueReport` | User-submitted feedback/errors |
| `AuditLog` | Complete history of every change (who, what, when) |

See `prisma/schema.prisma` for the full column definitions.

---

## Reading Data (lib/countries.ts)

```ts
// Get all countries for the index/search
const countries = await getAllCountries()
// → parses data/countries/index.json

// Get one country with locale fallback
const data = await getCountryByName("Germany", "de")
// → tries data/countries/de.de.json, falls back to data/countries/de.json
```

## Reading Translations (lib/dictionaries.ts)

```ts
const dict = await getDictionary("de")
// → parses data/dictionaries/de.json
// All UI labels for the page (button text, aria labels, etc.)
```
