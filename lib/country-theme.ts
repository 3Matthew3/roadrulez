export type TrafficLightVariant = "at" | "de" | "us"

/** Länder-Akzente – AT: Rot (Flagge), DE: Schwarz-Rot-Gold (Bundesflagge) */
export interface CountryTheme {
    iso2: string
    /** Primärer Akzent – Highlights, Icons, Text (DE: Gold der Flagge) */
    accent: string
    /** Sekundärfarbe (AT: Dunkelrot, DE: Rot der Flagge – sparsam) */
    accentDark: string
    /** Dezente Hintergrundtönung */
    accentMuted: string
    /** Optional: Schwarz der Bundesflagge */
    accentBlack?: string
    /** Aktive Buttons / Tabs (DE: Gold + schwarze Schrift) */
    fill: string
    fillText: string
    trafficLightVariant: TrafficLightVariant
    verifiedLocale?: string
}

const THEMES: Record<string, CountryTheme> = {
    AT: {
        iso2: "AT",
        accent: "#F87171",
        accentDark: "#DC2626",
        accentMuted: "rgba(220, 38, 38, 0.15)",
        fill: "#DC2626",
        fillText: "#FFFFFF",
        trafficLightVariant: "at",
        verifiedLocale: "de-AT",
    },
    DE: {
        iso2: "DE",
        accent: "#FFCC00",
        accentDark: "#DD0000",
        accentBlack: "#000000",
        accentMuted: "rgba(255, 204, 0, 0.18)",
        fill: "#FFCC00",
        fillText: "#000000",
        trafficLightVariant: "de",
        verifiedLocale: "de-DE",
    },
    IT: {
        iso2: "IT",
        accent: "#009246",
        accentDark: "#CE2B37",
        accentMuted: "rgba(0, 146, 70, 0.16)",
        fill: "#CE2B37",
        fillText: "#FFFFFF",
        trafficLightVariant: "de",
        verifiedLocale: "it-IT",
    },
    US: {
        iso2: "US",
        accent: "#3C3B6E",
        accentDark: "#B22234",
        accentMuted: "rgba(60, 59, 110, 0.28)",
        fill: "#B22234",
        fillText: "#FFFFFF",
        trafficLightVariant: "us",
        verifiedLocale: "en-US",
    },
    GB: {
        iso2: "GB",
        accent: "#C8102E",
        accentDark: "#012169",
        accentMuted: "rgba(200, 16, 46, 0.14)",
        fill: "#012169",
        fillText: "#FFFFFF",
        trafficLightVariant: "de",
        verifiedLocale: "en-GB",
    },
}

const DEFAULT_THEME: CountryTheme = {
    iso2: "XX",
    accent: "#60A5FA",
    accentDark: "#2563EB",
    accentMuted: "rgba(37, 99, 235, 0.15)",
    fill: "#2563EB",
    fillText: "#FFFFFF",
    trafficLightVariant: "de",
}

export function getCountryTheme(iso2: string): CountryTheme {
    return THEMES[iso2.toUpperCase()] ?? DEFAULT_THEME
}

const PREMIUM_COUNTRIES = new Set(["AT", "DE", "IT", "US", "GB"])

export function usesPremiumCountryLayout(iso2: string): boolean {
    return PREMIUM_COUNTRIES.has(iso2.toUpperCase())
}
