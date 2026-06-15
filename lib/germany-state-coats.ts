import type { RegionalVariation } from "@/types/country"

const COAT_BY_CODE: Record<string, string> = {
    "DE-BE": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Coat_of_arms_of_Berlin.svg/120px-Coat_of_arms_of_Berlin.svg.png",
    "DE-BY": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Coat_of_arms_of_Bavaria.svg/120px-Coat_of_arms_of_Bavaria.svg.png",
    "DE-HH": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Coat_of_arms_of_Hamburg.svg/120px-Coat_of_arms_of_Hamburg.svg.png",
    "DE-NW": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Coat_of_arms_of_North_Rhine-Westphalia.svg/120px-Coat_of_arms_of_North_Rhine-Westphalia.svg.png",
}

const COAT_BY_NAME: Record<string, string> = {
    berlin: COAT_BY_CODE["DE-BE"],
    munich: COAT_BY_CODE["DE-BY"],
    münchen: COAT_BY_CODE["DE-BY"],
    bavaria: COAT_BY_CODE["DE-BY"],
    bayern: COAT_BY_CODE["DE-BY"],
    hamburg: COAT_BY_CODE["DE-HH"],
}

function normalizeRegionKey(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
}

export function getGermanyStateCoatUrl(region: RegionalVariation): string | null {
    if (region.coat_of_arms_url) return region.coat_of_arms_url

    if (region.region_code) {
        const code = region.region_code.toUpperCase()
        if (COAT_BY_CODE[code]) return COAT_BY_CODE[code]
    }

    const key = normalizeRegionKey(region.region_name)
    if (COAT_BY_NAME[key]) return COAT_BY_NAME[key]

    return null
}
