import type { RegionName } from "@/lib/countries-page-shared"
import { REGION_ORDER } from "@/lib/countries-page-shared"

/** Territories with no meaningful road-traffic audience — omitted from browse lists. */
export const EXCLUDED_ISO2 = new Set(["AQ", "BV", "GS", "HM", "TF", "UM"])

const REGION_ISO2: Record<RegionName, readonly string[]> = {
    Africa: [
        "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG",
        "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML",
        "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD",
        "TZ", "TG", "TN", "UG", "ZM", "ZW", "EH", "RE", "YT", "SH", "IO",
    ],
    Europe: [
        "AD", "AL", "AT", "AX", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE", "ES", "FI",
        "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS", "IT", "JE", "LI", "LT", "LU",
        "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO", "PL", "PT", "RO", "RS", "RU", "SE", "SI", "SJ",
        "SK", "SM", "UA", "VA", "XK", "AM", "AZ", "GE", "TR",
    ],
    "North America": [
        "AG", "AI", "AW", "BB", "BL", "BM", "BQ", "BS", "BZ", "CA", "CR", "CU", "CW", "DM", "DO", "GD",
        "GL", "GP", "GT", "HN", "HT", "JM", "KN", "KY", "LC", "MF", "MQ", "MS", "MX", "NI", "PA", "PM",
        "PR", "SV", "SX", "TC", "TT", "US", "VC", "VG", "VI", "GU", "AS", "MP",
    ],
    "South America": ["AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PE", "PY", "SR", "UY", "VE"],
    Asia: [
        "AF", "AE", "BH", "BD", "BT", "BN", "KH", "CN", "CX", "CC", "HK", "MO", "IN", "ID", "IR", "IQ",
        "IL", "JP", "JO", "KZ", "KW", "KG", "LA", "LB", "MY", "MV", "MN", "MM", "NP", "KP", "KR", "OM",
        "PK", "PS", "PH", "QA", "SA", "SG", "LK", "SY", "TW", "TJ", "TH", "TL", "TM", "UZ", "VN", "YE",
    ],
    Oceania: [
        "AU", "CK", "FJ", "FM", "KI", "MH", "NC", "NF", "NR", "NU", "NZ", "PF", "PG", "PN", "PW", "SB", "TK",
        "TO", "TV", "VU", "WF", "WS",
    ],
}

const ISO2_TO_REGION = new Map<string, RegionName>()

for (const region of REGION_ORDER) {
    for (const iso2 of REGION_ISO2[region]) {
        ISO2_TO_REGION.set(iso2, region)
    }
}

export function getRegionForIso2(iso2: string): RegionName | undefined {
    return ISO2_TO_REGION.get(iso2.toUpperCase())
}

export function getIso2CodesForRegion(region: RegionName): string[] {
    return [...REGION_ISO2[region]].sort()
}

export function getAllBrowseIso2Codes(): string[] {
    return REGION_ORDER.flatMap((region) => REGION_ISO2[region]).sort()
}
