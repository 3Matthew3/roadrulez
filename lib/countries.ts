/**
 * lib/countries.ts
 *
 * Data source for the PUBLIC site.
 *
 * Strategy:
 *   1. Try the PostgreSQL database (Prisma) — this is the source of truth managed by the admin panel.
 *   2. If DB query fails (e.g. no DATABASE_URL set, country not yet in DB) →
 *      fall back to the JSON files in data/countries/.
 *
 * This means you can keep using JSON files for countries that haven't been
 * migrated to the DB yet — everything is backwards compatible.
 */

import fs from "fs"
import path from "path"
import { CountryData, CountryIndexItem, TrafficRules, RegionalVariation } from "@/types/country"

const dataDirectory = path.join(process.cwd(), "data/countries")

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely import prisma — returns null if DATABASE_URL is not set */
async function getPrisma() {
    if (!process.env.DATABASE_URL) return null
    try {
        const { prisma } = await import("@/lib/prisma")
        return prisma
    } catch {
        return null
    }
}

/**
 * Maps a Prisma Country row (with its relations) to the CountryData interface
 * that the public-facing components expect.
 */
function dbToCountryData(
    country: any,
    locale: string = "en"
): CountryData {
    // ── Locale overrides (stored in localeContent JSON column) ────────────────
    const localeOverrides: any =
        locale !== "en" && country.localeContent
            ? (country.localeContent as any)[locale] ?? {}
            : {}

    // ── Build rules from CountryRule rows ─────────────────────────────────────
    const rules = buildRulesFromRows(country.rules ?? []) as TrafficRules

    // ── Regional variations from Region rows ─────────────────────────────────
    // Filter out any null/undefined regions and use type guard
    const regional_variations: RegionalVariation[] = (country.regions ?? [])
        .filter((region): region is NonNullable<typeof region> => Boolean(region))
        .map((region) => {
            const diffs: Partial<TrafficRules> = buildRulesFromRows(
                region.ruleOverrides ?? []
            )
            return {
                region_type: "state" as const,
                region_name: region.name ?? "Unknown Region",
                region_code: region.id ?? "",
                differences: diffs,
                notes: undefined,
            }
        })

    return {
        name_en: country.name,
        name_local: country.nameLocal ?? country.name,
        iso2: country.iso2,
        iso3: country.iso3 ?? "",
        continent: country.continent ?? "",
        flag: country.flag ?? "",
        drive_side: country.drivingSide === "LEFT" ? "left" : "right",
        rules,
        summary: localeOverrides.summary ?? country.summary ?? "",
        common_traps: localeOverrides.commonTraps ?? country.commonTraps ?? [],
        rental_and_idp_notes:
            localeOverrides.rentalAndIdpNotes ?? country.rentalAndIdpNotes ?? "",
        idp_requirement: country.idpRequirement ?? undefined,
        regional_variations,
        last_verified: country.lastVerifiedAt
            ? country.lastVerifiedAt.toISOString().split("T")[0]
            : "",
        status: mapDbStatus(country.status),
        data_coverage: (country.dataCoverage as any) ?? undefined,
        sources: (country.sources ?? []).map((s: any) => s.url ?? s.title),
    }
}

/** Map DB CountryStatus enum → the string the public UI expects */
function mapDbStatus(
    status: string
): "sample" | "verified" | "needs_review" {
    if (status === "PUBLISHED" || status === "VERIFIED") return "verified"
    if (status === "DRAFT") return "sample"
    return "needs_review"
}

/**
 * Converts an array of CountryRule / RegionRuleOverride rows into a
 * (partial) TrafficRules object. Each row has a moduleKey + structuredValue JSON.
 */
function buildRulesFromRows(rows: any[]): Partial<TrafficRules> {
    const result: any = {}

    for (const row of rows) {
        const val = row.structuredValue ?? {}
        const note = row.textNotes

        switch (row.moduleKey) {
            case "speed_limits":
                result.speed_limits = {
                    urban: val.urban ?? 50,
                    rural: val.rural ?? 90,
                    motorway: val.motorway ?? 130,
                    units: val.units ?? "km/h",
                    notes: note ?? val.notes,
                }
                break
            case "alcohol_limit":
                result.alcohol_limit = {
                    value: val.general ?? val.value ?? 0.5,
                    unit: "‰" as const,
                    notes: note ?? val.notes,
                }
                break
            case "tolls":
                result.tolls = {
                    required: val.required ?? false,
                    type: val.type ?? "none",
                    notes: note ?? val.notes,
                }
                break
            case "mandatory_equipment":
                result.mandatory_equipment = val.items ?? []
                if (note) result.mandatory_equipment_notes = note
                break
            case "emergency_numbers":
                result.emergency_numbers = [
                    val.general,
                    val.police,
                    val.ambulance,
                    val.fire,
                ]
                    .filter(Boolean)
                    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
                break
            case "winter_rules":
                result.winter_rules =
                    note ??
                    (val.winter_tyres_required
                        ? `Winter tyres required: ${val.when ?? "in wintry conditions"}`
                        : "No mandatory winter tyres")
                break
            case "seatbelt":
                result.seatbelt_rules = note ?? (val.required ? "Mandatory for all passengers" : "")
                break
            case "child_seats":
                result.child_seat_rules =
                    note ??
                    (val.required_under_height_cm
                        ? `Required for children under ${val.required_under_height_cm}cm`
                        : "")
                break
            case "phone_usage":
                result.phone_usage_rules =
                    note ??
                    (val.handheld_banned ? "Handheld phone use is forbidden" : "No specific rules")
                break
            case "headlights":
                result.headlights_rules =
                    note ??
                    (val.daytime_required ? "Daytime running lights required" : "")
                break
            case "parking":
                result.parking_rules = note ?? val.notes ?? ""
                break
            // priority_rules has no dedicated module yet — will remain empty string
        }
    }

    // Sensible fallbacks so the UI never crashes on missing data
    return {
        speed_limits: { urban: 50, rural: 90, motorway: 130, units: "km/h" },
        alcohol_limit: { value: 0.5, unit: "‰" },
        seatbelt_rules: "",
        child_seat_rules: "",
        phone_usage_rules: "",
        headlights_rules: "",
        priority_rules: "",
        tolls: { required: false, type: "none" },
        parking_rules: "",
        mandatory_equipment: [],
        winter_rules: "",
        emergency_numbers: [],
        ...result,
    }
}

// ─── JSON fallback helpers (unchanged from original) ─────────────────────────

async function getJsonCountryData(
    iso2: string,
    locale: string = "en"
): Promise<CountryData | null> {
    try {
        const code = iso2.toLowerCase().replace(/[^a-z0-9]/g, "")

        if (locale !== "en") {
            const localFilePath = path.join(dataDirectory, `${code}.${locale}.json`)
            try {
                await fs.promises.access(localFilePath)
                const content = await fs.promises.readFile(localFilePath, "utf8")
                return JSON.parse(content)
            } catch {
                // fall through to English
            }
        }

        const filePath = path.join(dataDirectory, `${code}.json`)
        try {
            await fs.promises.access(filePath)
        } catch {
            return null
        }
        const content = await fs.promises.readFile(filePath, "utf8")
        return JSON.parse(content)
    } catch (error) {
        console.error(`[countries] JSON fallback failed for ${iso2}:`, error)
        return null
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the index list used by the homepage/search.
 * Tries DB first (PUBLISHED + VERIFIED countries), falls back to index.json.
 */
export async function getAllCountries(): Promise<CountryIndexItem[]> {
    const db = await getPrisma()

    if (db) {
        try {
            const countries = await db.country.findMany({
                where: { status: { in: ["PUBLISHED", "VERIFIED", "DRAFT"] } },
                select: {
                    name: true,
                    iso2: true,
                    flag: true,
                    nameLocal: true,
                    localeContent: true,
                },
                orderBy: { name: "asc" },
            })

            if (countries.length > 0) {
                return countries.map((c: { name: string; iso2: string; flag: string | null; nameLocal: string | null; localeContent: unknown }) => {
                    const locale = c.localeContent as Record<string, any> | null
                    const names: Record<string, string> = { en: c.name }
                    if (locale) {
                        for (const [lang, data] of Object.entries(locale)) {
                            if (data?.name) names[lang] = data.name
                        }
                    }
                    // German name from nameLocal if no explicit locale override
                    if (!names.de && c.nameLocal) names.de = c.nameLocal

                    return {
                        name: c.name,
                        names,
                        iso2: c.iso2,
                        flag: c.flag ?? "",
                    } satisfies CountryIndexItem
                })
            }
        } catch (e) {
            console.warn("[countries] DB index query failed, falling back to JSON:", e)
        }
    }

    // JSON fallback
    try {
        const filePath = path.join(dataDirectory, "index.json")
        const content = await fs.promises.readFile(filePath, "utf8")
        return JSON.parse(content)
    } catch {
        return []
    }
}

/**
 * Returns full CountryData for one country by name or ISO2 code.
 * Tries DB first (by iso2), falls back to JSON files.
 */
export async function getCountryData(
    iso2: string,
    locale: string = "en"
): Promise<CountryData | null> {
    const db = await getPrisma()

    if (db) {
        try {
            const country = await db.country.findUnique({
                where: { iso2: iso2.toUpperCase() },
                include: {
                    rules: true,
                    regions: {
                        include: { ruleOverrides: true },
                    },
                    sources: true,
                },
            })

            if (country) {
                return dbToCountryData(country, locale)
            }
        } catch (e) {
            console.warn(`[countries] DB query failed for ${iso2}, falling back to JSON:`, e)
        }
    }

    return getJsonCountryData(iso2, locale)
}

/**
 * Resolves a country by URL name (e.g. "Germany" or "Deutschland")
 * using the index, then loads the full data.
 */
export async function getCountryByName(
    nameOrCode: string,
    locale: string = "en"
): Promise<CountryData | null> {
    const index = await getAllCountries()
    const query = nameOrCode.toLowerCase()

    let found = index.find((p) => p.name.toLowerCase() === query)
    if (!found) found = index.find((p) => p.iso2.toLowerCase() === query)
    if (!found && locale !== "en") {
        found = index.find((p) => p.names?.[locale]?.toLowerCase() === query)
    }
    if (!found) {
        found = index.find((p) =>
            p.names && Object.values(p.names).some((n) => n.toLowerCase() === query)
        )
    }

    if (!found) return null
    return getCountryData(found.iso2, locale)
}
