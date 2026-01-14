# Project Overview: RoadRules Worldwide

## Introduction
RoadRules Worldwide is a Next.js web application designed to help travelers understand driving rules in different countries. It features an interactive 3D map, a country search, and detailed rule pages.

## Key Directories

### `/app`
Contains the Next.js App Router pages and layouts.
- `page.tsx`: The Homepage.
- `layout.tsx`: Global layout (Header/Footer).
- `map/page.tsx`: The interactive map view.
- `country/[name]/page.tsx`: The dynamic details page for each country.

### `/components`
React components.
- `map/`: Contains the MapLibre interactive map logic.
- `country/`: Specific components for the country detail page (e.g., `region-selector.tsx`).
- `ui/`: Reusable UI elements (Buttons, Accordions, Badges).

### `/data`
File-based database.
- `countries/`: JSON files storing the actual rule data (e.g., `jp.json`, `de.json`).

### `/lib`
Utility functions.
- `countries.ts`: Logic to read and parse the JSON data files.

### `/types`
TypeScript definitions.
- `country.ts`: Defines the strict schema for what a "Country" object looks like (rules, speed limits, etc.).
