import type { Metadata } from "next"
import CountriesPageView from "@/components/countries/countries-page-view"
import { getCountriesPageData } from "@/lib/countries-page-data"
import { getDictionary } from "@/lib/dictionaries"

interface PageProps {
    params: { lang: string }
    searchParams?: { q?: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const dict = await getDictionary(params.lang)
    const labels = dict.countries_page as Record<string, string>
    return {
        title: `${labels.page_title} | RoadRulez`,
        description: labels.page_subtitle,
    }
}

export default async function CountriesPage({ params, searchParams }: PageProps) {
    const [dict, data] = await Promise.all([
        getDictionary(params.lang),
        getCountriesPageData(params.lang),
    ])

    const labels = {
        ...(dict.countries_page as Record<string, string>),
        left: dict.common.left,
        right: dict.common.right,
    }

    return (
        <CountriesPageView
            lang={params.lang}
            data={data}
            labels={labels}
            initialSearchQuery={searchParams?.q ?? ""}
        />
    )
}
