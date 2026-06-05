import { getCountryData } from "@/lib/countries"
import { getDictionary } from "@/lib/dictionaries"
import CountrySourcesView from "@/components/sources/country-sources-view"

interface PageProps {
    params: { lang: string; code: string }
}

export default async function CountrySourcesPage({ params }: PageProps) {
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

    const entries = data.source_entries ?? []
    const pageLabels = dict.sources_page as Record<string, string>

    return (
        <CountrySourcesView
            countryName={data.name_en}
            countryIso2={data.iso2}
            lang={params.lang}
            lastVerified={data.last_verified}
            sources={entries}
            labels={pageLabels}
        />
    )
}
