import { COUNTRY_SEEDS } from "@/lib/country-seeds/catalog"
import { getAllCountries, getCountryData } from "@/lib/countries"
import type {
    CountriesPageData,
    CountryPreview,
    RegionGroup,
    RegionName,
} from "@/lib/countries-page-shared"
import { REGION_ORDER } from "@/lib/countries-page-shared"
import type { CountryData, CountryIndexItem } from "@/types/country"

export type { CountriesPageData, CountryPreview, RegionGroup, RegionName } from "@/lib/countries-page-shared"

export const POPULAR_COUNTRY_CODES = ["AT", "DE", "US", "FR", "IT", "ES"] as const

/** Major destinations shown as “coming soon” when not yet in the catalog. */
const COMING_SOON_BY_REGION: Record<RegionName, string[]> = {
    Europe: ["TR", "RU", "GE", "AM"],
    "North America": ["GT", "CR", "PA", "CU", "DO"],
    "South America": ["CL", "CO", "PE", "UY", "VE"],
    Asia: ["MY", "SG", "PH", "VN", "PK", "BD", "LK", "NP"],
    Oceania: ["NZ", "FJ", "PG", "NC"],
    Africa: ["EG", "MA", "KE", "NG", "TZ", "MU"],
}

function localizedName(entry: CountryIndexItem, lang: string) {
    return entry.names?.[lang] || entry.names?.en || entry.name
}

function formatAlcohol(rules: CountryData["rules"], lang: string) {
    const { value, unit } = rules.alcohol_limit
    if (value === 0) return lang === "de" ? "0,0 ‰" : "0.0"
    if (unit === "BAC") {
        return lang === "de" ? `${value.toFixed(2).replace(".", ",")} %` : `${value.toFixed(2)}% BAC`
    }
    return `${value} ${unit}`
}

function formatTopSpeed(rules: CountryData["rules"]) {
    const { motorway, units } = rules.speed_limits
    return `${motorway} ${units}`
}

function previewFromData(
    data: CountryData,
    entry: CountryIndexItem | undefined,
    lang: string,
    available: boolean
): CountryPreview {
    return {
        iso2: data.iso2,
        name: entry ? localizedName(entry, lang) : data.name_en,
        flag: data.flag || entry?.flag || "",
        driveSide: data.drive_side,
        topSpeed: formatTopSpeed(data.rules),
        alcoholLimit: formatAlcohol(data.rules, lang),
        image: data.header_images?.[0],
        available,
    }
}

function previewComingSoon(iso2: string, entry: CountryIndexItem | undefined, lang: string): CountryPreview {
    return {
        iso2,
        name: entry ? localizedName(entry, lang) : iso2,
        flag: entry?.flag || "",
        driveSide: "right",
        topSpeed: "—",
        alcoholLimit: "—",
        available: false,
    }
}

export async function getCountriesPageData(lang: string): Promise<CountriesPageData> {
    const index = await getAllCountries()
    const indexByIso = new Map(index.map((c) => [c.iso2, c]))
    const availableIso = new Set(Object.keys(COUNTRY_SEEDS))

    const popular = (
        await Promise.all(
            POPULAR_COUNTRY_CODES.map(async (iso2) => {
                const data = await getCountryData(iso2, lang)
                if (!data) return null
                return previewFromData(data, indexByIso.get(iso2), lang, true)
            })
        )
    ).filter(Boolean) as CountryPreview[]

    const regions: RegionGroup[] = REGION_ORDER.map((regionId) => {
        const comingSoonCodes = COMING_SOON_BY_REGION[regionId].filter((iso2) => !availableIso.has(iso2))

        return {
            id: regionId,
            available: [],
            comingSoon: comingSoonCodes.map((iso2) =>
                previewComingSoon(iso2, indexByIso.get(iso2), lang)
            ),
        }
    })

    await Promise.all(
        regions.map(async (region) => {
            const seeds = Object.values(COUNTRY_SEEDS).filter((s) => s.continent === region.id)
            region.available = (
                await Promise.all(
                    seeds.map(async (seed) => {
                        const data = await getCountryData(seed.iso2, lang)
                        if (!data) return null
                        return previewFromData(data, indexByIso.get(seed.iso2), lang, true)
                    })
                )
            )
                .filter(Boolean)
                .sort((a, b) => a!.name.localeCompare(b!.name)) as CountryPreview[]
        })
    )

    const filteredRegions = regions.filter((r) => r.available.length > 0 || r.comingSoon.length > 0)

    return {
        popular,
        regions: filteredRegions,
        stats: {
            availableCount: availableIso.size,
            plannedCount: 120,
        },
    }
}
