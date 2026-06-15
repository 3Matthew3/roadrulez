export const REGION_ORDER = [
    "Europe",
    "North America",
    "South America",
    "Asia",
    "Oceania",
    "Africa",
] as const

export type RegionName = (typeof REGION_ORDER)[number]

export interface CountryPreview {
    iso2: string
    name: string
    flag: string
    driveSide: "left" | "right"
    topSpeed: string
    alcoholLimit: string
    image?: string
    available: boolean
}

export interface RegionGroup {
    id: RegionName
    available: CountryPreview[]
    comingSoon: CountryPreview[]
}

export interface CountriesPageData {
    popular: CountryPreview[]
    regions: RegionGroup[]
    stats: {
        availableCount: number
        plannedCount: number
    }
}

export function getRegionLabel(region: RegionName, lang: string) {
    const labels: Record<string, Record<RegionName, string>> = {
        en: {
            Europe: "Europe",
            "North America": "North America",
            "South America": "South America",
            Asia: "Asia",
            Oceania: "Oceania",
            Africa: "Africa",
        },
        de: {
            Europe: "Europa",
            "North America": "Nordamerika",
            "South America": "Südamerika",
            Asia: "Asien",
            Oceania: "Ozeanien",
            Africa: "Afrika",
        },
        es: {
            Europe: "Europa",
            "North America": "América del Norte",
            "South America": "América del Sur",
            Asia: "Asia",
            Oceania: "Oceanía",
            Africa: "África",
        },
        ja: {
            Europe: "ヨーロッパ",
            "North America": "北アメリカ",
            "South America": "南アメリカ",
            Asia: "アジア",
            Oceania: "オセアニア",
            Africa: "アフリカ",
        },
    }
    return labels[lang]?.[region] ?? labels.en[region]
}
