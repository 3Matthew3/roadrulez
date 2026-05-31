export type SourceSuggestion = {
    moduleKey: string
    fieldName: string
    label: string
    suggestedValue: string
}

function collectRegexMatches(text: string, pattern: RegExp): RegExpExecArray[] {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`
    const regex = new RegExp(pattern.source, flags)
    const matches: RegExpExecArray[] = []
    let match: RegExpExecArray | null = regex.exec(text)

    while (match !== null) {
        matches.push(match)
        match = regex.exec(text)
    }

    return matches
}

export function extractSourceSuggestions(text: string, preferredModuleKey?: string | null): SourceSuggestion[] {
    const suggestions: SourceSuggestion[] = []
    const allow = (moduleKey: string) => !preferredModuleKey || preferredModuleKey === moduleKey

    if (allow("speed_limits")) {
        const speedMatches = collectRegexMatches(text, /(\d{2,3})\s*km\s*\/?\s*h/gi)
        const speeds = Array.from(
            new Set(speedMatches.map((match) => Number(match[1])).filter((n) => n >= 20 && n <= 160))
        )
        if (speeds.length > 0) {
            const sorted = speeds.sort((a, b) => a - b)
            suggestions.push({
                moduleKey: "speed_limits",
                fieldName: "structuredValue",
                label: "Detected speed limits",
                suggestedValue: JSON.stringify({
                    urban: sorted[0],
                    rural: sorted[1] ?? sorted[0],
                    motorway: sorted[sorted.length - 1],
                    units: "km/h",
                    notes: `Detected from source: ${speeds.join(", ")} km/h`,
                }),
            })
        }
    }

    if (allow("alcohol_limit")) {
        const alcoholMatches = collectRegexMatches(text, /0[.,]\d+\s?(?:‰|promille|bac|mg\/l)/gi)
        if (alcoholMatches.length > 0) {
            const raw = alcoholMatches[0][0].replace(",", ".")
            const value = Number.parseFloat(raw)
            if (!Number.isNaN(value)) {
                suggestions.push({
                    moduleKey: "alcohol_limit",
                    fieldName: "structuredValue",
                    label: "Detected alcohol limit",
                    suggestedValue: JSON.stringify({
                        value,
                        unit: raw.includes("BAC") ? "BAC" : "‰",
                        notes: `Detected from source: ${alcoholMatches[0][0]}`,
                    }),
                })
            }
        }
    }

    if (allow("requirements") || allow("rental_and_idp")) {
        if (/international driving permit|internationaler führerschein|idp/i.test(text)) {
            suggestions.push({
                moduleKey: "idp_requirement",
                fieldName: "idpRequirement",
                label: "IDP mentioned in source",
                suggestedValue: "Source mentions International Driving Permit requirements.",
            })
        }
    }

    return suggestions
}

export function pickPrimarySuggestion(
    suggestions: SourceSuggestion[],
    preferredModuleKey?: string | null
): SourceSuggestion | null {
    if (suggestions.length === 0) return null
    if (preferredModuleKey) {
        return suggestions.find((item) => item.moduleKey === preferredModuleKey) ?? suggestions[0]
    }
    return suggestions[0]
}
