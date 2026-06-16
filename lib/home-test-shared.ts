import { getAllCountries, getCountryData } from "@/lib/countries"
import { getCountriesPageData } from "@/lib/countries-page-data"
import { getDictionary } from "@/lib/dictionaries"
import type { CountryData } from "@/types/country"

export function getHomeTestLabels(lang: string) {
    const labels: Record<
        string,
        {
            indexTitle: string
            indexSubtitle: string
            openVariant: string
            variantA: string
            variantB: string
            variantC: string
            variantADesc: string
            variantBDesc: string
            variantCDesc: string
            intentRental: string
            intentRentalDesc: string
            intentFines: string
            intentFinesDesc: string
            intentTolls: string
            intentTollsDesc: string
            thenPickCountry: string
            exampleLink: string
        }
    > = {
        de: {
            indexTitle: "Startseiten-Varianten",
            indexSubtitle: "Drei Entwürfe zum Vergleichen.",
            openVariant: "Variante öffnen",
            variantA: "A — Search-first",
            variantB: "B — Minimal",
            variantC: "C — Intent-Einstiege",
            variantADesc: "Große Suche, Chips, Produkt-Preview, Stats",
            variantBDesc: "Nur Hero, Suche, 6 Länder, ein Link",
            variantCDesc: "Suche plus Mietwagen / Bußgelder / Maut",
            intentRental: "Mietwagen im Ausland",
            intentRentalDesc: "Führerschein, IDP und Mietwagen-Hinweise pro Land",
            intentFines: "Bußgelder vermeiden",
            intentFinesDesc: "Typische Strafen für Tempo, Handy, Rotlicht",
            intentTolls: "Maut & Vignette",
            intentTollsDesc: "Autobahn-Maut, Vignetten und Sonderstrecken",
            thenPickCountry: "Dann Land wählen",
            exampleLink: "Beispiel",
        },
        en: {
            indexTitle: "Homepage variants",
            indexSubtitle: "Three drafts to compare.",
            openVariant: "Open variant",
            variantA: "A — Search-first",
            variantB: "B — Minimal",
            variantC: "C — Intent entry points",
            variantADesc: "Large search, chips, product preview, stats",
            variantBDesc: "Hero, search, 6 countries, one link only",
            variantCDesc: "Search plus rental / fines / tolls intents",
            intentRental: "Rental car abroad",
            intentRentalDesc: "Licence, IDP and rental notes per country",
            intentFines: "Avoid fines",
            intentFinesDesc: "Typical penalties for speed, phone, red light",
            intentTolls: "Tolls & vignette",
            intentTollsDesc: "Motorway tolls, vignettes and special routes",
            thenPickCountry: "Then pick a country",
            exampleLink: "Example",
        },
    }

    return labels[lang] ?? labels.en
}

export interface HomeTestPopularCountry {
    iso2: string
    displayName: string
    flag: string
}

export interface HomeTestContext {
    dict: Awaited<ReturnType<typeof getDictionary>>
    labels: ReturnType<typeof getHomeTestLabels>
    popular: HomeTestPopularCountry[]
    previewCountry: CountryData | null
    previewName: string
    availableCount: number
}

export async function getHomeTestContext(lang: string): Promise<HomeTestContext> {
    const [dict, allCountries, previewCountry, pageData] = await Promise.all([
        getDictionary(lang),
        getAllCountries(),
        getCountryData("AT", lang),
        getCountriesPageData(lang),
    ])

    const indexByIso = new Map(allCountries.map((c) => [c.iso2, c]))

    const popular = pageData.popular.map((country) => ({
        iso2: country.iso2,
        displayName: country.name,
        flag: country.flag,
    }))

    const previewName =
        indexByIso.get("AT")?.names?.[lang] || previewCountry?.name_local || "Austria"

    return {
        dict,
        labels: getHomeTestLabels(lang),
        popular,
        previewCountry,
        previewName,
        availableCount: pageData.stats.availableCount,
    }
}
