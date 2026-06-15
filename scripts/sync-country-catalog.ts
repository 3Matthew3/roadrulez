/**
 * Writes merged country JSON files and index.json from the TypeScript seed catalog.
 * Run: npx tsx scripts/sync-country-catalog.ts
 */
import fs from "fs"
import path from "path"
import { COUNTRY_SEEDS } from "../lib/country-seeds/catalog"
import { mergeCountryWithSeed, getCatalogIndexEntries } from "../lib/country-seeds/merge"
import type { CountryData } from "../types/country"

const dataDir = path.join(process.cwd(), "data/countries")

function loadExisting(iso2: string): CountryData | null {
    const filePath = path.join(dataDir, `${iso2.toLowerCase()}.json`)
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as CountryData
}

for (const seed of Object.values(COUNTRY_SEEDS)) {
    const existing = loadExisting(seed.iso2)
    const merged = mergeCountryWithSeed(existing, seed)
    if (!merged) continue

    const outPath = path.join(dataDir, `${seed.iso2.toLowerCase()}.json`)
    fs.writeFileSync(outPath, `${JSON.stringify(merged, null, 4)}\n`, "utf8")
    console.log(`Wrote ${outPath}`)
}

const index = getCatalogIndexEntries().sort((a, b) => a.name.localeCompare(b.name))
fs.writeFileSync(path.join(dataDir, "index.json"), `${JSON.stringify(index, null, 4)}\n`, "utf8")
console.log(`Wrote index.json (${index.length} countries)`)
