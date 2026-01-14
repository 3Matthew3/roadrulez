# Data Schema Documentation

The project uses a strict TypeScript schema to ensure data consistency.

## `CountryData` Interface
Located in `types/country.ts`.

### Core Fields
- **name_en**: English name.
- **iso2**: 2-letter country code (e.g., "JP").
- **drive_side**: "left" or "right".

### `TrafficRules` Object
Contains the nationwide defaults.
- **speed_limits**: Urban, Rural, Motorway values.
- **alcohol_limit**: Legal BAC limit.
- **tolls**: Info on toll roads.

### `RegionalVariation` Object
Allows overriding rules for specific areas.
- **region_name**: e.g., "Tokyo".
- **differences**: An object that mirrors `TrafficRules` but only contains the fields that differ.
- **notes**: Specific text notes for that region.
