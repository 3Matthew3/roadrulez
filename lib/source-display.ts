import type { CountrySourceEntry, SourceTypeValue, TrustLevelValue } from "@/types/source"

export type SourceCategoryId = "OFFICIAL" | "AUTOMOBILE_ASSOCIATION" | "OTHER"

export const SOURCE_CATEGORY_ORDER: SourceCategoryId[] = [
    "OFFICIAL",
    "AUTOMOBILE_ASSOCIATION",
    "OTHER",
]

export interface SourceTrustDisplay {
    stars: number
    labelKey: "trust_official_government" | "trust_primary" | "trust_trusted_secondary" | "trust_unverified"
}

export interface SourceStats {
    total: number
    official: number
    supplementary: number
}

export interface SourceGroup {
    id: SourceCategoryId
    labelKey: "group_official" | "group_automobile" | "group_other"
    sources: CountrySourceEntry[]
}

const OFFICIAL_SOURCE_TYPES: SourceTypeValue[] = ["GOVERNMENT", "POLICE", "MINISTRY"]

const MODULE_USAGE_KEYS: Record<string, string[]> = {
    driving_basics: ["usage_driving_licence", "usage_traffic_rules", "usage_vehicle_duties"],
    requirements: ["usage_before_drive", "usage_rental_idp"],
    tolls: ["usage_tolls_vignette"],
    speed_limits: ["usage_speed_limits"],
    alcohol_limit: ["usage_alcohol"],
    mandatory_equipment: ["usage_equipment"],
    winter_rules: ["usage_winter"],
    emergency_numbers: ["usage_emergency"],
    idp_requirement: ["usage_idp"],
    phone_usage: ["usage_phone"],
    headlights: ["usage_lights"],
    parking: ["usage_parking"],
}

export function isOfficialGovernmentSource(source: CountrySourceEntry): boolean {
    return OFFICIAL_SOURCE_TYPES.includes(source.sourceType)
}

export function categorizeSource(source: CountrySourceEntry): SourceCategoryId {
    if (OFFICIAL_SOURCE_TYPES.includes(source.sourceType)) return "OFFICIAL"
    if (source.sourceType === "AUTOMOBILE_ASSOCIATION") return "AUTOMOBILE_ASSOCIATION"
    return "OTHER"
}

export function getSourceStats(sources: CountrySourceEntry[]): SourceStats {
    const official = sources.filter(isOfficialGovernmentSource).length
    return {
        total: sources.length,
        official,
        supplementary: sources.length - official,
    }
}

export function shouldGroupSources(sources: CountrySourceEntry[]): boolean {
    const categories = new Set(sources.map(categorizeSource))
    return sources.length >= 5 || (categories.size >= 2 && sources.length >= 4)
}

export function groupSources(sources: CountrySourceEntry[]): SourceGroup[] {
    const buckets = new Map<SourceCategoryId, CountrySourceEntry[]>()
    for (const category of SOURCE_CATEGORY_ORDER) {
        buckets.set(category, [])
    }

    for (const source of sources) {
        buckets.get(categorizeSource(source))!.push(source)
    }

    const labelKeys: Record<SourceCategoryId, SourceGroup["labelKey"]> = {
        OFFICIAL: "group_official",
        AUTOMOBILE_ASSOCIATION: "group_automobile",
        OTHER: "group_other",
    }

    return SOURCE_CATEGORY_ORDER.map((id) => ({
        id,
        labelKey: labelKeys[id],
        sources: buckets.get(id) ?? [],
    })).filter((group) => group.sources.length > 0)
}

export function getTrustDisplay(source: CountrySourceEntry): SourceTrustDisplay {
    if (source.trustLevel === "PRIMARY" && isOfficialGovernmentSource(source)) {
        return { stars: 5, labelKey: "trust_official_government" }
    }
    if (source.trustLevel === "PRIMARY") {
        return { stars: 5, labelKey: "trust_primary" }
    }
    if (source.trustLevel === "TRUSTED_SECONDARY") {
        return { stars: 4, labelKey: "trust_trusted_secondary" }
    }
    return { stars: 2, labelKey: "trust_unverified" }
}

export function getSourceModuleKeys(source: CountrySourceEntry): string[] {
    if (source.usageModuleKeys?.length) return source.usageModuleKeys
    if (source.moduleKey) return [source.moduleKey]
    return []
}

export function getSourceUsageLabelKeys(source: CountrySourceEntry): string[] {
    const keys = new Set<string>()
    for (const moduleKey of getSourceModuleKeys(source)) {
        const mapped = MODULE_USAGE_KEYS[moduleKey]
        if (mapped) {
            mapped.forEach((key) => keys.add(key))
        } else {
            keys.add(`usage_${moduleKey}`)
        }
    }
    return Array.from(keys)
}

export function formatSourceDate(
    iso: string | null | undefined,
    lang: string,
    mode: "month" | "day" = "day"
): string | null {
    if (!iso) return null
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return null

    const locale = lang === "de" ? "de-AT" : lang === "ja" ? "ja-JP" : lang === "es" ? "es-ES" : "en-US"

    if (mode === "month") {
        return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date)
    }

    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date)
}

export function matchesSourceSearch(source: CountrySourceEntry, query: string): boolean {
    const haystack = [source.title, source.publisher, source.notes, source.url]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

    return haystack.includes(query.toLowerCase())
}

export function sortSourcesForDisplay(sources: CountrySourceEntry[]): CountrySourceEntry[] {
    const trustOrder: Record<TrustLevelValue, number> = {
        PRIMARY: 0,
        TRUSTED_SECONDARY: 1,
        UNVERIFIED: 2,
    }

    return [...sources].sort((a, b) => {
        const officialDiff = Number(isOfficialGovernmentSource(b)) - Number(isOfficialGovernmentSource(a))
        if (officialDiff !== 0) return officialDiff

        const trustDiff = trustOrder[a.trustLevel] - trustOrder[b.trustLevel]
        if (trustDiff !== 0) return trustDiff

        return a.title.localeCompare(b.title)
    })
}
