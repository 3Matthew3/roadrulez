import type { CountryData, CountryFaqEntry, CountryFineEntry } from "@/types/country"
import type { CountrySourceEntry } from "@/types/source"

export type CountrySeed = Omit<
    CountryData,
    "name_en" | "name_local" | "iso2" | "iso3" | "continent" | "flag"
> & {
    iso2: string
    name_en: string
    name_local: string
    iso3: string
    continent: string
    flag: string
    indexNames?: Record<string, string>
}

export function govSource(
    iso2: string,
    id: string,
    title: string,
    url: string,
    publisher: string,
    usageModuleKeys: string[] = ["speed_limits", "alcohol_limit", "tolls", "priority_rules"]
): CountrySourceEntry {
    return {
        id: `${iso2.toLowerCase()}-${id}`,
        title,
        url,
        publisher,
        publishedDate: null,
        sourceType: "GOVERNMENT",
        trustLevel: "PRIMARY",
        moduleKey: usageModuleKeys[0],
        usageModuleKeys,
    }
}

export function defaultFaq(countryName: string, countryNameDe: string): CountryFaqEntry[] {
    return [
        {
            id: "licence",
            category: "documents",
            question: `Can I drive in ${countryName} with my foreign licence?`,
            question_de: `Kann ich in ${countryNameDe} mit meinem ausländischen Führerschein fahren?`,
            answer: `Many visitors can drive with a valid national licence for short stays, but rental companies and police may require an International Driving Permit (IDP). Always confirm before you travel.`,
            answer_de: `Viele Besucher dürfen mit gültigem nationalen Führerschein kurzzeitig fahren, Mietwagenfirmen und Polizei verlangen aber oft einen Internationalen Führerschein (IDP). Vor der Reise klären.`,
            relatedRules: [{ label: "Documents", label_de: "Dokumente" }],
        },
        {
            id: "speed",
            category: "speed_limits",
            question: `What are the default speed limits in ${countryName}?`,
            question_de: `Welche Standard-Tempolimits gelten in ${countryNameDe}?`,
            answer: `Default limits depend on road type, but posted signs always override general defaults. Check urban, rural, and motorway limits on the country guide above.`,
            answer_de: `Standardlimits hängen vom Straßentyp ab, ausgeschilderte Limits haben immer Vorrang. Urban-, Land- und Autobahn-Limits findest du oben im Länderguide.`,
            relatedRules: [{ label: "Speed limits", label_de: "Tempolimits" }],
        },
        {
            id: "sources",
            category: "documents",
            question: `Where can I verify the latest rules for ${countryName}?`,
            question_de: `Wo kann ich die aktuellen Regeln für ${countryNameDe} prüfen?`,
            answer: `Use the official sources listed on this site and re-check with government transport or police authorities before driving.`,
            answer_de: `Nutze die offiziellen Quellen auf dieser Seite und prüfe vor der Fahrt erneut bei Behörden für Verkehr oder Polizei.`,
            relatedRules: [{ label: "Official sources", label_de: "Offizielle Quellen" }],
        },
    ]
}

export function defaultTopFines(currency = "€"): CountryFineEntry[] {
    return [
        { title: "Speeding in built-up areas", amount: `from ${currency}50` },
        { title: "Using phone while driving", amount: `${currency}100+` },
        { title: "Parking violations", amount: `from ${currency}25` },
    ]
}

export function defaultTopFinesDe(): CountryFineEntry[] {
    return [
        { title: "Tempo innerorts", amount: "ab €50" },
        { title: "Handy am Steuer", amount: "€100+" },
        { title: "Parkverstöße", amount: "ab €25" },
    ]
}

export { getCountryHeaderImages, hasGenericPrimaryHeaderImage, shouldReplaceHeaderImages } from "@/lib/country-header-images"
