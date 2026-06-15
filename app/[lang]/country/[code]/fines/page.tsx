import type { Metadata } from "next"
import { getCountryData } from "@/lib/countries"
import { getDictionary } from "@/lib/dictionaries"
import CountryFinesView from "@/components/fines/country-fines-view"

interface PageProps {
    params: { lang: string; code: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const iso2 = params.code.toUpperCase()
    const [data, dict] = await Promise.all([
        getCountryData(iso2, params.lang),
        getDictionary(params.lang),
    ])

    if (!data) {
        return { title: "Traffic Fines | RoadRulez" }
    }

    const labels = dict.fines_page as Record<string, string>
    const localizedName =
        params.lang === "de" ? data.name_local || data.name_en : data.name_en

    return {
        title: `${labels.page_title.replace("{country}", localizedName)} | RoadRulez`,
        description: labels.page_subtitle.replace("{country}", localizedName),
    }
}

export default async function CountryFinesPage({ params }: PageProps) {
    const iso2 = params.code.toUpperCase()
    const [data, dict] = await Promise.all([
        getCountryData(iso2, params.lang),
        getDictionary(params.lang),
    ])

    if (!data) {
        return (
            <div className="container px-4 py-16 text-center text-slate-400">
                {dict.common.not_found}
            </div>
        )
    }

    const finesData = data.traffic_fines
    const localizedName =
        params.lang === "de" ? data.name_local || data.name_en : data.name_en

    if (!finesData) {
        return (
            <div className="container px-4 py-16 text-center text-slate-400">
                {(dict.fines_page as Record<string, string>).empty ?? dict.common.not_found}
            </div>
        )
    }

    return (
        <CountryFinesView
            countryName={data.name_en}
            localizedName={localizedName}
            countryIso2={data.iso2}
            lang={params.lang}
            headerImages={data.header_images}
            lastVerified={data.last_verified}
            finesData={finesData}
            sourceEntries={data.source_entries ?? []}
            labels={dict.fines_page as Record<string, string>}
            sourceLabels={dict.sources_page as Record<string, string>}
            navLabels={dict.country_nav as Record<string, string>}
        />
    )
}
