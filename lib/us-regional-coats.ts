import type { RegionalVariation } from "@/types/country"

const COAT_BY_CODE: Record<string, string> = {
    CA: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Seal_of_California.svg/120px-Seal_of_California.svg.png",
    FL: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Seal_of_Florida.svg/120px-Seal_of_Florida.svg.png",
    NY: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Coat_of_arms_of_New_York.svg/120px-Coat_of_arms_of_New_York.svg.png",
}

const COAT_BY_NAME: Record<string, string> = {
    california: COAT_BY_CODE.CA,
    florida: COAT_BY_CODE.FL,
    "new york city": COAT_BY_CODE.NY,
    nyc: COAT_BY_CODE.NY,
}

function normalizeRegionKey(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
}

export function getUsRegionalCoatUrl(region: RegionalVariation): string | null {
    if (region.coat_of_arms_url) return region.coat_of_arms_url

    if (region.region_code) {
        const url = COAT_BY_CODE[region.region_code.toUpperCase()]
        if (url) return url
    }

    const key = normalizeRegionKey(region.region_name)
    return COAT_BY_NAME[key] ?? null
}
