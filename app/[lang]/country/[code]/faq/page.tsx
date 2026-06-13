import type { Metadata } from "next"
import { getCountryData } from "@/lib/countries"
import { getDictionary } from "@/lib/dictionaries"
import CountryFaqView from "@/components/faq/country-faq-view"

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
        return { title: "FAQ | RoadRulez" }
    }

    const labels = dict.faq_page as Record<string, string>
    const localizedName =
        params.lang === "de" ? data.name_local || data.name_en : data.name_en

    return {
        title: `${labels.page_title.replace("{country}", localizedName)} | RoadRulez`,
        description: labels.page_subtitle.replace("{country}", localizedName),
    }
}

export default async function CountryFaqPage({ params }: PageProps) {
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

    const faqEntries = data.faq ?? []
    const localizedName =
        params.lang === "de" ? data.name_local || data.name_en : data.name_en

    if (faqEntries.length === 0) {
        return (
            <div className="container px-4 py-16 text-center text-slate-400">
                {(dict.faq_page as Record<string, string>).empty ?? dict.common.not_found}
            </div>
        )
    }

    return (
        <CountryFaqView
            countryName={data.name_en}
            localizedName={localizedName}
            countryIso2={data.iso2}
            lang={params.lang}
            headerImages={data.header_images}
            faqEntries={faqEntries}
            sourceEntries={data.source_entries ?? []}
            labels={dict.faq_page as Record<string, string>}
        />
    )
}
