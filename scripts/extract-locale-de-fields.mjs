/**
 * Build a partial locale JSON from *_de fields in the English base country file.
 *
 * Usage: node scripts/extract-locale-de-fields.mjs at
 */
import fs from "fs"
import path from "path"

const iso2 = (process.argv[2] || "").toLowerCase()
if (!iso2) {
    console.error("Usage: node scripts/extract-locale-de-fields.mjs <iso2>")
    process.exit(1)
}

const dataDir = path.join(process.cwd(), "data", "countries")
const basePath = path.join(dataDir, `${iso2}.json`)
const outPath = path.join(dataDir, `${iso2}.de.json`)

function pickDeOverlay(source) {
    if (source === null || source === undefined) return undefined

    if (Array.isArray(source)) {
        const items = source.map((item) => pickDeOverlay(item)).filter(Boolean)
        return items.length ? items : undefined
    }

    if (typeof source !== "object") return undefined

    const overlay = {}
    let hasDeField = false

    if (typeof source.id === "string") overlay.id = source.id
    if (source.category) overlay.category = source.category
    if (source.href) overlay.href = source.href
    if (source.icon) overlay.icon = source.icon

    for (const [key, value] of Object.entries(source)) {
        if (key.endsWith("_de")) {
            overlay[key.slice(0, -3)] = value
            hasDeField = true
            continue
        }

        if (key === "id" || key === "category" || key === "href" || key === "icon") continue

        if (Array.isArray(value) || (value && typeof value === "object")) {
            const nested = pickDeOverlay(value)
            if (nested !== undefined) {
                overlay[key] = nested
            }
        }
    }

    const contentKeys = Object.keys(overlay).filter(
        (key) => !["id", "category", "href", "icon"].includes(key)
    )

    if (!hasDeField && contentKeys.length === 0) return undefined
    if (Object.keys(overlay).length === 0) return undefined

    return overlay
}

function buildLocaleFile(country) {
    const locale = {
        iso2: country.iso2,
    }

    const faq = country.faq?.map((entry) => pickDeOverlay(entry)).filter(Boolean)
    if (faq?.length) locale.faq = faq

    const trafficFines = pickDeOverlay(country.traffic_fines)
    if (trafficFines) locale.traffic_fines = trafficFines

    return locale
}

const base = JSON.parse(fs.readFileSync(basePath, "utf8"))
const locale = buildLocaleFile(base)

fs.writeFileSync(outPath, `${JSON.stringify(locale, null, 4)}\n`, "utf8")
console.log(`Wrote ${outPath}`)
console.log(`  faq entries: ${locale.faq?.length ?? 0}`)
console.log(`  fine categories: ${locale.traffic_fines?.categories?.length ?? 0}`)
