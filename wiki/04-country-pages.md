# Country Detail Pages

Every country page lives at `/{lang}/country/{iso2}` (e.g. `/en/country/de`) and is built from modular components stacked vertically. This page is **server-rendered**.

---

## Page File

`app/[lang]/country/[code]/page.tsx`

### What It Does

```
1. Normalise ISO2 from URL (e.g. "de" → "DE")
2. Read ?vehicle=car|motorcycle|moped from search params
3. Parallel load: country data + dictionary + country index + session
4. If no data found → show <ComingSoonCountry />
5. Merge vehicle overrides onto national rules
6. Enable inline edit for ADMIN on EN + car view
7. Render the component stack below
```

### Coming Soon Country

If no JSON file exists for a country (e.g. `/country/luxembourg`), it shows `components/coming-soon-country.tsx` — an animated placeholder with a "Back to Home" and "View Map" button instead of a 404 page.

---

## The 11 Modular Components

All live in `components/country/modular/`. They all receive `data`, `rules`, and `dict` as props.

### 1. `CountryHero`
**The full-width header banner.**
- Country name (localized), flag image from FlagCDN, driving side badge, coverage badge
- Vehicle switcher tabs (Car / Motorcycle / Moped) — changes `?vehicle=` in URL
- Background: header images from `data.header_images` or a gradient fallback

### 2. `VehicleSpecificsCard` *(not modular — in `components/country/`)*
**Shown only when a non-car vehicle is selected.**
- Displays vehicle-specific rules that differ from the car defaults
- Helmet rules, lane splitting, motorway access, licensing notes
- Hidden when `vehicleType === "car"`

### 3. `QuickSummary`
**The "at a glance" card row at the top.**
- 3–4 stat chips: drive side, speed limit (urban), alcohol limit, toll type
- Pulls from `data.summary` for the 2–3 sentence overview text
- Common traps listed as yellow warning badges (`data.common_traps`)

### 4. `RequirementsCard`
**What you must have in the car.**
- Lists `rules.mandatory_equipment` as a checklist
- IDP requirement note (`data.idp_requirement`)
- Rental and IDP notes (`data.rental_and_idp_notes`)

### 5. `SpeedLimitsCard`
**Urban / Rural / Motorway speed limits.**
- Visualized as three stacked bars with the limit value and unit
- Shows a highlighted "status" badge (sample / verified / needs_review) from `data.status`
- Notes from `rules.speed_limits.notes` shown below

### 6. `AlcoholLimitCard`
**Legal BAC limit.**
- Large number display with unit (‰ or BAC)
- Colour changes: green (0.5 or less) → amber → red
- Notes from `rules.alcohol_limit.notes`

### 7. `EmergencyCard`
**Emergency phone numbers.**
- Lists `rules.emergency_numbers` as large clickable tel: links (useful on mobile)

### 8. `TollsCard`
**Toll road information.**
- Shows `rules.tolls.required` (yes/no), toll type, and notes
- Toll types: vignette, toll booth, electronic, mixed, none

### 9. `DrivingBasics`
**The "good to know" rules.**
- Seatbelt rules, child seat rules, phone usage, headlights, priority rules, parking, winter rules
- Each displayed as a row with an icon and plain-text description

### 10. `DetailedRulesAccordion`
**Expandable detailed rules.**
- Accordion of the more verbose rule fields
- Good for rules that need longer explanations

### 11. `ChecklistCard`
**Pre-trip checklist + sources preview.**
- Mandatory equipment list (inline-editable for ADMIN)
- Embeds `SourcesCard` — linked sources with trust badges + link to full sources page

### 12. `SourcesCard`
**Official sources (in ChecklistCard or standalone).**
- Renders `data.source_entries[]` from DB with external links
- Falls back to plain `data.sources[]` strings from JSON
- Link: `/{lang}/country/{iso2}/sources`

### 13. `TrafficSignsGrid`
**Road signs visual guide.**
- Displays `data.road_signs[]` as a grid of image + title + description
- Only renders if the country has `road_signs` data

---

## Region Selector

`components/country/region-selector.tsx`

Shown at the bottom if `data.regional_variations` is not empty. Lets users select a state/city to see how rules differ from the national baseline. The diffs are shown as a comparison table — only the fields that actually change are shown.

---

## Feedback Form

`components/country/feedback-form.tsx`

A simple form at the bottom of every country page that submits to `/api/feedback` (or your preferred endpoint). Fields: message, email (optional), country name (pre-filled). This feeds into the admin panel's **Issue Inbox**.

---

## Data Flow Summary

```
URL: /de/country/de?vehicle=motorcycle
         ↓
page.tsx: getCountryData("DE", "de")
         ↓
lib/countries.ts: DB (Prisma) → fallback data/countries/de.json
         ↓
Merge: data.rules + data.vehicles.motorcycle = rules
         ↓
Props flow down to modular components (+ inlineEdit for ADMIN)
         ↓
Server-rendered HTML → hydrated in browser
```

---

## Related Pages

- **Country sources:** `/{lang}/country/{iso2}/sources` — full source list with type/trust metadata
- **Global sources:** `/{lang}/sources` — all published country sources

---

## Adding a New Country

See **[06-how-to.md](./06-how-to.md)** for the step-by-step guide.
