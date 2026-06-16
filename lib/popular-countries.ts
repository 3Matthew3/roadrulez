import "server-only"

import fs from "fs"
import path from "path"
import { unstable_cache } from "next/cache"
import { COUNTRY_SEEDS } from "@/lib/country-seeds/catalog"
import { getCountryViews } from "@/lib/plausible"

/** Hard fallback if config file is missing or invalid. */
export const DEFAULT_POPULAR_COUNTRY_CODES = ["AT", "DE", "US", "FR", "IT", "ES"] as const

const POPULAR_COUNTRIES_FILE = path.join(process.cwd(), "data/popular-countries.json")
const AVAILABLE_ISO = new Set(Object.keys(COUNTRY_SEEDS))
const PLAUSIBLE_ENABLED = Boolean(process.env.PLAUSIBLE_API_TOKEN)

export interface PlausibleCountryViewRow {
    dimensions?: string[]
    metrics?: number[]
}

function normalizeCountryCodes(codes: unknown): string[] {
    if (!Array.isArray(codes)) return []

    const normalized: string[] = []
    const seen = new Set<string>()

    for (const value of codes) {
        if (typeof value !== "string") continue
        const code = value.trim().toUpperCase()
        if (!/^[A-Z]{2}$/.test(code)) continue
        if (!AVAILABLE_ISO.has(code)) continue
        if (seen.has(code)) continue
        seen.add(code)
        normalized.push(code)
    }

    return normalized
}

export function parsePlausibleCountryViewResults(response: unknown): string[] {
    if (!response || typeof response !== "object") return []

    const results = (response as { results?: PlausibleCountryViewRow[] }).results
    if (!Array.isArray(results)) return []

    return normalizeCountryCodes(results.map((row) => row.dimensions?.[0]))
}

export function mergePopularCountryCodes(primaryCodes: string[], limit: number): string[] {
    const merged: string[] = []
    const seen = new Set<string>()

    for (const code of primaryCodes) {
        if (seen.has(code)) continue
        merged.push(code)
        seen.add(code)
        if (merged.length >= limit) return merged
    }

    for (const code of DEFAULT_POPULAR_COUNTRY_CODES) {
        if (seen.has(code)) continue
        merged.push(code)
        seen.add(code)
        if (merged.length >= limit) return merged
    }

    return merged
}

export function getManualPopularCountryCodesFromConfig(config: unknown): string[] {
    const codes =
        config && typeof config === "object" && "codes" in config
            ? (config as { codes?: unknown }).codes
            : config

    const normalized = normalizeCountryCodes(codes)
    return normalized.length > 0 ? normalized : [...DEFAULT_POPULAR_COUNTRY_CODES]
}

async function readManualPopularCountryCodes(): Promise<string[]> {
    try {
        const raw = await fs.promises.readFile(POPULAR_COUNTRIES_FILE, "utf8")
        return getManualPopularCountryCodesFromConfig(JSON.parse(raw))
    } catch {
        return [...DEFAULT_POPULAR_COUNTRY_CODES]
    }
}

async function fetchPopularCountryCodes(limit: number): Promise<string[]> {
    if (!PLAUSIBLE_ENABLED) {
        const manual = await readManualPopularCountryCodes()
        return mergePopularCountryCodes(manual, limit)
    }

    const response = await getCountryViews("30d", limit + 8)
    const fromAnalytics = parsePlausibleCountryViewResults(response)

    if (fromAnalytics.length === 0) {
        const manual = await readManualPopularCountryCodes()
        return mergePopularCountryCodes(manual, limit)
    }

    return mergePopularCountryCodes(fromAnalytics, limit)
}

const getCachedPopularCountryCodes = unstable_cache(
    fetchPopularCountryCodes,
    ["popular-country-codes", PLAUSIBLE_ENABLED ? "plausible" : "manual"],
    { revalidate: PLAUSIBLE_ENABLED ? 3600 : 300 }
)

export async function getPopularCountryCodes(limit = 6): Promise<string[]> {
    return getCachedPopularCountryCodes(limit)
}
