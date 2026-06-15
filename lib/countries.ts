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
import countries from "i18n-iso-countries"
import deLocale from "i18n-iso-countries/langs/de.json"
import enLocale from "i18n-iso-countries/langs/en.json"
import esLocale from "i18n-iso-countries/langs/es.json"
import jaLocale from "i18n-iso-countries/langs/ja.json"
import { CountryData, CountryIndexItem, TrafficRules, RegionalVariation } from "@/types/country"
import type { CountrySourceEntry } from "@/types/source"
import { getCountrySeed, mergeCountryWithSeed, getCatalogIndexEntries } from "@/lib/country-seeds/merge"

const dataDirectory = path.join(process.cwd(), "data/countries")
const searchLocales = {
    en: enLocale,
    de: deLocale,
    es: esLocale,
    ja: jaLocale,
} as const
const SEARCH_COUNTRIES_CACHE_MS = 5 * 60 * 1000
let searchLocalesRegistered = false
let worldwideCountryIndexCache: CountryIndexItem[] | null = null
let searchCountriesCache: { expiresAt: number; countries: CountryIndexItem[] } | null = null
let searchCountriesPromise: Promise<CountryIndexItem[]> | null = null

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
    locale: string = "en",
    fallback?: CountryData | null
): CountryData {
    // ── Locale overrides (stored in localeContent JSON column) ────────────────
    const localeOverrides: any =
        locale !== "en" && country.localeContent
            ? (country.localeContent as any)[locale] ?? {}
            : {}

    // ── Build rules from CountryRule rows ─────────────────────────────────────
    const rules = mergeTrafficRules(
        fallback?.rules,
        buildRulesFromRows(country.rules ?? [], false)
    )

    // ── Regional variations from Region rows ─────────────────────────────────
    // Filter out any null/undefined regions and use type guard
    const regional_variations: RegionalVariation[] = (country.regions ?? [])
        .filter((region: any): region is NonNullable<typeof region> => Boolean(region))
        .map((region: any) => {
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

    const hasDbRegions = regional_variations.length > 0
    const sourceEntries: CountrySourceEntry[] = (country.sources ?? []).map((s: any) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        publisher: s.publisher,
        publishedDate: s.publishedDate ? new Date(s.publishedDate).toISOString() : null,
        sourceType: s.sourceType ?? "SECONDARY",
        trustLevel: s.trustLevel ?? "UNVERIFIED",
        moduleKey: s.moduleKey,
        notes: s.notes,
        checkStatus: s.checkStatus,
        lastCheckedAt: s.lastCheckedAt ? new Date(s.lastCheckedAt).toISOString() : null,
    }))
    const sources = sourceEntries.length > 0
        ? sourceEntries.map((s) => s.url ?? s.title)
        : fallback?.sources ?? []
    const preferLocalizedFallback = locale !== "en"

    return {
        name_en: country.name,
        name_local: country.nameLocal ?? fallback?.name_local ?? country.name,
        iso2: country.iso2,
        iso3: country.iso3 ?? fallback?.iso3 ?? "",
        continent: country.continent ?? fallback?.continent ?? "",
        flag: country.flag ?? fallback?.flag ?? "",
        header_images: fallback?.header_images,
        drive_side: country.drivingSide === "LEFT" ? "left" : "right",
        rules,
        summary: localeOverrides.summary ?? (preferLocalizedFallback ? fallback?.summary : country.summary) ?? country.summary ?? "",
        quick_answer_bullets: fallback?.quick_answer_bullets,
        common_traps: localeOverrides.commonTraps ?? (preferLocalizedFallback ? fallback?.common_traps : country.commonTraps) ?? country.commonTraps ?? [],
        rental_and_idp_notes:
            localeOverrides.rentalAndIdpNotes ?? (preferLocalizedFallback ? fallback?.rental_and_idp_notes : country.rentalAndIdpNotes) ?? country.rentalAndIdpNotes ?? "",
        idp_requirement: country.idpRequirement ?? fallback?.idp_requirement ?? undefined,
        regional_variations: hasDbRegions ? regional_variations : fallback?.regional_variations,
        last_verified: country.lastVerifiedAt
            ? country.lastVerifiedAt.toISOString().split("T")[0]
            : fallback?.last_verified ?? "",
        status: mapDbStatus(country.status),
        data_coverage: (country.dataCoverage as any) ?? undefined,
        sources: sources.length > 0 ? sources : fallback?.sources ?? [],
        source_entries: sourceEntries.length > 0 ? sourceEntries : fallback?.source_entries,
        road_signs: fallback?.road_signs,
        vehicles: fallback?.vehicles,
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
function buildRulesFromRows(rows: any[], includeDefaults = true): Partial<TrafficRules> {
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
                result.emergency_numbers = (Array.isArray(val.numbers)
                    ? val.numbers
                    : [
                        val.general,
                        val.police,
                        val.ambulance,
                        val.fire,
                    ])
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
            case "priority_rules":
                result.priority_rules = note ?? val.notes ?? ""
                break
        }
    }

    if (!includeDefaults) return result

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

function mergeTrafficRules(
    fallbackRules: TrafficRules | undefined,
    dbRules: Partial<TrafficRules>
): TrafficRules {
    const defaults = buildRulesFromRows([]) as TrafficRules

    return {
        speed_limits: {
            ...defaults.speed_limits,
            ...fallbackRules?.speed_limits,
            ...dbRules.speed_limits,
        },
        alcohol_limit: {
            ...defaults.alcohol_limit,
            ...fallbackRules?.alcohol_limit,
            ...dbRules.alcohol_limit,
        },
        seatbelt_rules: dbRules.seatbelt_rules ?? fallbackRules?.seatbelt_rules ?? defaults.seatbelt_rules,
        child_seat_rules: dbRules.child_seat_rules ?? fallbackRules?.child_seat_rules ?? defaults.child_seat_rules,
        phone_usage_rules: dbRules.phone_usage_rules ?? fallbackRules?.phone_usage_rules ?? defaults.phone_usage_rules,
        headlights_rules: dbRules.headlights_rules ?? fallbackRules?.headlights_rules ?? defaults.headlights_rules,
        priority_rules: dbRules.priority_rules ?? fallbackRules?.priority_rules ?? defaults.priority_rules,
        tolls: {
            ...defaults.tolls,
            ...fallbackRules?.tolls,
            ...dbRules.tolls,
        },
        parking_rules: dbRules.parking_rules ?? fallbackRules?.parking_rules ?? defaults.parking_rules,
        mandatory_equipment: dbRules.mandatory_equipment ?? fallbackRules?.mandatory_equipment ?? defaults.mandatory_equipment,
        winter_rules: dbRules.winter_rules ?? fallbackRules?.winter_rules ?? defaults.winter_rules,
        emergency_numbers: dbRules.emergency_numbers ?? fallbackRules?.emergency_numbers ?? defaults.emergency_numbers,
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
                const parsed = JSON.parse(content) as CountryData
                const seed = getCountrySeed(iso2)
                return mergeCountryWithSeed(parsed, seed)
            } catch {
                // fall through to English
            }
        }

        const filePath = path.join(dataDirectory, `${code}.json`)
        try {
            await fs.promises.access(filePath)
            const content = await fs.promises.readFile(filePath, "utf8")
            const parsed = JSON.parse(content) as CountryData
            const seed = getCountrySeed(iso2)
            return mergeCountryWithSeed(parsed, seed)
        } catch {
            const seed = getCountrySeed(iso2)
            return seed ? (seed as CountryData) : null
        }
    } catch (error) {
        console.error(`[countries] JSON fallback failed for ${iso2}:`, error)
        return null
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function getJsonCountryIndex(): Promise<CountryIndexItem[]> {
    try {
        const filePath = path.join(dataDirectory, "index.json")
        const content = await fs.promises.readFile(filePath, "utf8")
        return JSON.parse(content)
    } catch {
        return []
    }
}

function getWorldwideCountryIndex(): CountryIndexItem[] {
    if (worldwideCountryIndexCache) return worldwideCountryIndexCache

    if (!searchLocalesRegistered) {
        for (const localeData of Object.values(searchLocales)) {
            countries.registerLocale(localeData)
        }
        searchLocalesRegistered = true
    }

    const englishNames = countries.getNames("en", { select: "official" })

    worldwideCountryIndexCache = Object.entries(englishNames).map(([iso2, name]) => {
        const names = Object.keys(searchLocales).reduce<Record<string, string>>((localizedNames, locale) => {
            localizedNames[locale] = countries.getName(iso2, locale, { select: "official" }) || name
            return localizedNames
        }, {})

        return {
            name,
            names,
            iso2,
            flag: "",
        } satisfies CountryIndexItem
    })

    return worldwideCountryIndexCache
}

function mergeCountryIndexes(baseCountries: CountryIndexItem[], preferredCountries: CountryIndexItem[]) {
    const countriesByIso2 = new Map<string, CountryIndexItem>()

    for (const country of baseCountries) {
        countriesByIso2.set(country.iso2, country)
    }

    for (const country of preferredCountries) {
        const existing = countriesByIso2.get(country.iso2)
        countriesByIso2.set(country.iso2, {
            name: country.name,
            names: {
                ...(existing?.names ?? {}),
                ...(country.names ?? {}),
                en: country.name,
            },
            iso2: country.iso2,
            flag: country.flag || existing?.flag || "",
        })
    }

    return Array.from(countriesByIso2.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Returns the index list used by the homepage/search.
 * Tries DB first (PUBLISHED + VERIFIED countries), enriched with JSON names,
 * then falls back to index.json.
 */
export async function getAllCountries(): Promise<CountryIndexItem[]> {
    const db = await getPrisma()
    const jsonIndex = await getJsonCountryIndex()
    const jsonByIso2 = new Map(jsonIndex.map((country) => [country.iso2, country]))

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
                    const jsonCountry = jsonByIso2.get(c.iso2)
                    const names: Record<string, string> = {
                        ...(jsonCountry?.names ?? {}),
                        en: c.name,
                    }
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
                        flag: c.flag ?? jsonCountry?.flag ?? "",
                    } satisfies CountryIndexItem
                })
            }
        } catch (e) {
            console.warn("[countries] DB index query failed, falling back to JSON:", e)
        }
    }

    return mergeCountryIndexes(getCatalogIndexEntries(), jsonIndex)
}

/**
 * Returns all countries searchable by the public UI.
 * Countries with app content keep their curated/localized names; the rest come
 * from the ISO country registry and naturally fall through to the Coming Soon page.
 */
export async function getSearchCountries(): Promise<CountryIndexItem[]> {
    const now = Date.now()

    if (searchCountriesCache && searchCountriesCache.expiresAt > now) {
        return searchCountriesCache.countries
    }

    if (searchCountriesPromise) return searchCountriesPromise

    searchCountriesPromise = (async () => {
        const contentCountries = await getAllCountries()
        const worldwideCountries = getWorldwideCountryIndex()
        const mergedCountries = mergeCountryIndexes(
            worldwideCountries,
            mergeCountryIndexes(contentCountries, getCatalogIndexEntries())
        )

        searchCountriesCache = {
            expiresAt: Date.now() + SEARCH_COUNTRIES_CACHE_MS,
            countries: mergedCountries,
        }

        return mergedCountries
    })().finally(() => {
        searchCountriesPromise = null
    })

    return searchCountriesPromise
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
                const jsonFallback = await getJsonCountryData(iso2, locale)
                const seed = getCountrySeed(iso2)
                const mergedFallback = jsonFallback ?? (seed ? (seed as CountryData) : null)
                return dbToCountryData(country, locale, mergedFallback)
            }
        } catch (e) {
            console.warn(`[countries] DB query failed for ${iso2}, falling back to JSON:`, e)
        }
    }

    return getJsonCountryData(iso2, locale) ?? (() => {
        const seed = getCountrySeed(iso2)
        return seed ? (seed as CountryData) : null
    })()
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
