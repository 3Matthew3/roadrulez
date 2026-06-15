import type { RegionalVariation } from "@/types/country"

const COAT_BY_CODE: Record<string, string> = {
    "GB-LND": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Coat_of_arms_of_the_City_of_London.svg/120px-Coat_of_arms_of_the_City_of_London.svg.png",
    "GB-SCT": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Royal_Coat_of_Arms_of_the_Kingdom_of_Scotland.svg/120px-Royal_Coat_of_Arms_of_the_Kingdom_of_Scotland.svg.png",
}

const COAT_BY_NAME: Record<string, string> = {
    london: COAT_BY_CODE["GB-LND"],
    scotland: COAT_BY_CODE["GB-SCT"],
}

function normalizeRegionKey(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
}

export function getUkRegionalCoatUrl(region: RegionalVariation): string | null {
    if (region.coat_of_arms_url) return region.coat_of_arms_url

    if (region.region_code) {
        const url = COAT_BY_CODE[region.region_code.toUpperCase()]
        if (url) return url
    }

    const key = normalizeRegionKey(region.region_name)
    return COAT_BY_NAME[key] ?? null
}
