import type { RegionalVariation } from "@/types/country"

const COAT_BY_CODE: Record<string, string> = {
    "IT-62": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Coat_of_arms_of_Rome.svg/120px-Coat_of_arms_of_Rome.svg.png",
    "IT-25": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Coat_of_arms_of_Milan.svg/120px-Coat_of_arms_of_Milan.svg.png",
}

const COAT_BY_NAME: Record<string, string> = {
    rome: COAT_BY_CODE["IT-62"],
    rom: COAT_BY_CODE["IT-62"],
    milan: COAT_BY_CODE["IT-25"],
    milano: COAT_BY_CODE["IT-25"],
}

function normalizeRegionKey(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
}

export function getItalyRegionalCoatUrl(region: RegionalVariation): string | null {
    if (region.coat_of_arms_url) return region.coat_of_arms_url

    if (region.region_code) {
        const url = COAT_BY_CODE[region.region_code.toUpperCase()]
        if (url) return url
    }

    const key = normalizeRegionKey(region.region_name)
    return COAT_BY_NAME[key] ?? null
}
