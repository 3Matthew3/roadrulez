import type { CountryTheme, TrafficLightVariant } from "@/lib/country-theme"

function theme(
    iso2: string,
    accent: string,
    accentDark: string,
    options?: {
        fill?: string
        fillText?: string
        accentBlack?: string
        accentMuted?: string
        trafficLightVariant?: TrafficLightVariant
        verifiedLocale?: string
    }
): CountryTheme {
    return {
        iso2,
        accent,
        accentDark,
        accentMuted: options?.accentMuted ?? `${accentDark}26`,
        accentBlack: options?.accentBlack,
        fill: options?.fill ?? accentDark,
        fillText: options?.fillText ?? "#FFFFFF",
        trafficLightVariant: options?.trafficLightVariant ?? "de",
        verifiedLocale: options?.verifiedLocale,
    }
}

/** Flag-inspired accents for countries without a hand-tuned premium theme. */
export const FLAG_THEMES: Record<string, CountryTheme> = {
    AD: theme("AD", "#5B8FD9", "#0018A8"),
    AL: theme("AL", "#E41E20", "#000000"),
    BA: theme("BA", "#002395", "#FECB00", { fill: "#002395" }),
    BE: theme("BE", "#FDDA24", "#EF3340", { accentBlack: "#000000", fill: "#FDDA24", fillText: "#000000" }),
    BG: theme("BG", "#00966E", "#D62612"),
    BY: theme("BY", "#007C82", "#CF101A", { fill: "#CF101A" }),
    CH: theme("CH", "#FF0000", "#FFFFFF", { fill: "#FF0000" }),
    CY: theme("CY", "#D57800", "#007A3D"),
    CZ: theme("CZ", "#11457E", "#D7141A"),
    DK: theme("DK", "#C8102E", "#C8102E"),
    EE: theme("EE", "#0072CE", "#000000", { accentBlack: "#000000" }),
    ES: theme("ES", "#AA151B", "#F1BF00", { fill: "#AA151B" }),
    FI: theme("FI", "#003580", "#003580"),
    FR: theme("FR", "#0055A4", "#EF4135", { fill: "#0055A4" }),
    GR: theme("GR", "#0D5EAF", "#004C98"),
    HR: theme("HR", "#171796", "#FF0000", { fill: "#FF0000" }),
    HU: theme("HU", "#477050", "#CE2939", { fill: "#CE2939" }),
    IE: theme("IE", "#169B62", "#FF883E", { fill: "#169B62" }),
    IS: theme("IS", "#02529C", "#DC1E35", { fill: "#02529C" }),
    LI: theme("LI", "#002B7F", "#CF142B"),
    LT: theme("LT", "#FDB913", "#006A44", { fill: "#006A44" }),
    LU: theme("LU", "#00A1DE", "#EF3340", { fill: "#EF3340" }),
    LV: theme("LV", "#9E3039", "#9E3039"),
    MC: theme("MC", "#CE1126", "#FFFFFF", { fill: "#CE1126" }),
    MD: theme("MD", "#0046AE", "#FFD200", { fill: "#0046AE" }),
    ME: theme("ME", "#C40308", "#D4AF37", { fill: "#C40308" }),
    MK: theme("MK", "#D20000", "#FFE600", { fill: "#D20000" }),
    MT: theme("MT", "#CF142B", "#FFFFFF", { fill: "#CF142B" }),
    NL: theme("NL", "#AE1C28", "#21468B", { fill: "#21468B" }),
    NO: theme("NO", "#BA0C2F", "#00205B", { fill: "#BA0C2F" }),
    PL: theme("PL", "#DC143C", "#DC143C"),
    PT: theme("PT", "#006600", "#FF0000", { fill: "#006600" }),
    RO: theme("RO", "#002B7F", "#FCD116", { fill: "#002B7F" }),
    RS: theme("RS", "#C6363C", "#0C4076", { fill: "#C6363C" }),
    SE: theme("SE", "#006AA7", "#FECC00", { fill: "#006AA7" }),
    SI: theme("SI", "#005DA4", "#FFFFFF", { fill: "#005DA4" }),
    SK: theme("SK", "#0B4EA2", "#EE1C25", { fill: "#EE1C25" }),
    UA: theme("UA", "#005BBB", "#FFD500", { fill: "#005BBB" }),
    XK: theme("XK", "#244AA5", "#D0A650", { fill: "#244AA5" }),
    CA: theme("CA", "#FF0000", "#FF0000"),
    MX: theme("MX", "#006847", "#CE1126", { fill: "#006847" }),
    BR: theme("BR", "#009C3B", "#FFDF00", { fill: "#009C3B", fillText: "#FFFFFF" }),
    AR: theme("AR", "#74ACDF", "#338AF3", { fill: "#338AF3" }),
    JP: theme("JP", "#BC002D", "#BC002D"),
    KR: theme("KR", "#003478", "#CD2E3A", { fill: "#CD2E3A" }),
    AU: theme("AU", "#00008B", "#FF0000", { fill: "#00008B" }),
    TH: theme("TH", "#A51931", "#2D2A4A", { fill: "#A51931" }),
    ID: theme("ID", "#FF0000", "#FFFFFF", { fill: "#FF0000" }),
    IN: theme("IN", "#FF9933", "#138808", { fill: "#138808" }),
    CN: theme("CN", "#DE2910", "#DE2910", { fill: "#DE2910" }),
    TW: theme("TW", "#FE0000", "#000095", { fill: "#000095" }),
    AE: theme("AE", "#00732F", "#FF0000", { accentBlack: "#000000", fill: "#00732F" }),
    ZA: theme("ZA", "#007A4D", "#FFB612", { accentDark: "#002395", fill: "#007A4D" }),
}
