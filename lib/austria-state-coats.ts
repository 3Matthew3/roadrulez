import type { RegionalVariation } from "@/types/country"

/** ISO 3166-2:AT codes and common English names → Wikimedia Commons coat of arms (PNG thumb). */
const COAT_BY_CODE: Record<string, string> = {
    "AT-1": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Burgenland_Wappen.svg/120px-Burgenland_Wappen.svg.png",
    "AT-2": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/K%C3%A4rnten_Wappen.svg/120px-K%C3%A4rnten_Wappen.svg.png",
    "AT-3": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Nieder%C3%B6sterreich_Wappen.svg/120px-Nieder%C3%B6sterreich_Wappen.svg.png",
    "AT-4": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Ober%C3%B6sterreich_Wappen.svg/120px-Ober%C3%B6sterreich_Wappen.svg.png",
    "AT-5": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Salzburg_Wappen.svg/120px-Salzburg_Wappen.svg.png",
    "AT-6": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Steiermark_Wappen.svg/120px-Steiermark_Wappen.svg.png",
    "AT-7": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Tirol_Wappen.svg/120px-Tirol_Wappen.svg.png",
    "AT-8": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Vorarlberg_Wappen.svg/120px-Vorarlberg_Wappen.svg.png",
    "AT-9": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Wien_Wappen.svg/120px-Wien_Wappen.svg.png",
}

const COAT_BY_NAME: Record<string, string> = {
    vienna: COAT_BY_CODE["AT-9"],
    wien: COAT_BY_CODE["AT-9"],
    tyrol: COAT_BY_CODE["AT-7"],
    tirol: COAT_BY_CODE["AT-7"],
    salzburg: COAT_BY_CODE["AT-5"],
    burgenland: COAT_BY_CODE["AT-1"],
    carinthia: COAT_BY_CODE["AT-2"],
    karnten: COAT_BY_CODE["AT-2"],
    kärnten: COAT_BY_CODE["AT-2"],
    "lower austria": COAT_BY_CODE["AT-3"],
    "niederösterreich": COAT_BY_CODE["AT-3"],
    "upper austria": COAT_BY_CODE["AT-4"],
    "oberösterreich": COAT_BY_CODE["AT-4"],
    styria: COAT_BY_CODE["AT-6"],
    steiermark: COAT_BY_CODE["AT-6"],
    vorarlberg: COAT_BY_CODE["AT-8"],
}

function normalizeRegionKey(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+and\s+.*/i, "")
        .trim()
}

export function getAustriaStateCoatUrl(region: RegionalVariation): string | null {
    if (region.coat_of_arms_url) return region.coat_of_arms_url

    if (region.region_code) {
        const code = region.region_code.toUpperCase()
        if (COAT_BY_CODE[code]) return COAT_BY_CODE[code]
    }

    const key = normalizeRegionKey(region.region_name)
    if (COAT_BY_NAME[key]) return COAT_BY_NAME[key]

    const firstWord = key.split(/\s+/)[0]
    if (firstWord && COAT_BY_NAME[firstWord]) return COAT_BY_NAME[firstWord]

    return null
}
