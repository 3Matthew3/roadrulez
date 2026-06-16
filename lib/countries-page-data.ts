import { COUNTRY_SEEDS } from "@/lib/country-seeds/catalog"
import { getAllCountries, getCountryData, getSearchCountries } from "@/lib/countries"
import { getIso2CodesForRegion } from "@/lib/country-region-map"
import { getPopularCountryCodes } from "@/lib/popular-countries"
import type {
    CountriesPageData,
    CountryPreview,
    RegionGroup,
    RegionName,
} from "@/lib/countries-page-shared"
import { REGION_ORDER } from "@/lib/countries-page-shared"
import type { CountryData, CountryIndexItem } from "@/types/country"

export type { CountriesPageData, CountryPreview, RegionGroup, RegionName } from "@/lib/countries-page-shared"

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
    const [index, searchIndex] = await Promise.all([getAllCountries(), getSearchCountries()])
    const indexByIso = new Map(
        [...index, ...searchIndex].map((country) => [country.iso2, country] as const)
    )
    const availableIso = new Set(Object.keys(COUNTRY_SEEDS))

    const popularCodes = await getPopularCountryCodes(6)

    const popular = (
        await Promise.all(
            popularCodes.map(async (iso2) => {
                const data = await getCountryData(iso2, lang)
                if (!data) return null
                return previewFromData(data, indexByIso.get(iso2), lang, true)
            })
        )
    ).filter(Boolean) as CountryPreview[]

    const regions: RegionGroup[] = await Promise.all(
        REGION_ORDER.map(async (regionId) => {
            const regionCodes = getIso2CodesForRegion(regionId)
            const available: CountryPreview[] = []
            const comingSoon: CountryPreview[] = []

            await Promise.all(
                regionCodes.map(async (iso2) => {
                    if (availableIso.has(iso2)) {
                        const data = await getCountryData(iso2, lang)
                        if (data) {
                            available.push(previewFromData(data, indexByIso.get(iso2), lang, true))
                        }
                        return
                    }

                    comingSoon.push(previewComingSoon(iso2, indexByIso.get(iso2), lang))
                })
            )

            const sortByName = (a: CountryPreview, b: CountryPreview) =>
                a.name.localeCompare(b.name, lang === "de" ? "de" : "en")

            return {
                id: regionId,
                available: available.sort(sortByName),
                comingSoon: comingSoon.sort(sortByName),
            }
        })
    )

    const comingSoonTotal = regions.reduce((sum, region) => sum + region.comingSoon.length, 0)

    return {
        popular,
        regions,
        stats: {
            availableCount: availableIso.size,
            plannedCount: comingSoonTotal,
        },
    }
}
