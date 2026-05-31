import Link from "next/link"
import { getCountryData } from "@/lib/countries"
import { getDictionary } from "@/lib/dictionaries"
import SourcesCard from "@/components/country/modular/SourcesCard"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"

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

    return (
        <div className="min-h-screen bg-[#0a0e17] text-slate-200">
            <div className="container px-4 md:px-6 py-10 space-y-8">
                <div>
                    <Link
                        href={`/${params.lang}/country/${data.iso2.toLowerCase()}`}
                        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {dict.sources_page.back_to_country.replace("{country}", data.name_en)}
                    </Link>
                    <h1 className="text-3xl font-bold text-white">
                        {dict.sources_page.country_title.replace("{country}", data.name_en)}
                    </h1>
                    <p className="text-slate-400 mt-2">{dict.sources_page.country_subtitle}</p>
                </div>

                {entries.length > 0 ? (
                    <div className="grid gap-4">
                        {entries.map((source) => (
                            <article key={source.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">{source.title}</h2>
                                        {source.publisher && (
                                            <p className="text-sm text-slate-400 mt-1">{source.publisher}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300">
                                            {TRUST_LEVEL_LABELS[source.trustLevel]}
                                        </span>
                                        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400">
                                            {SOURCE_TYPE_LABELS[source.sourceType]}
                                        </span>
                                    </div>
                                </div>
                                {source.notes && (
                                    <p className="text-sm text-slate-400 mt-3">{source.notes}</p>
                                )}
                                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300"
                                    >
                                        {dict.sources_page.open_source}
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                    {source.moduleKey && (
                                        <span className="text-slate-500">{dict.sources_page.module}: {source.moduleKey}</span>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <SourcesCard data={data} dict={dict} lang={params.lang} />
                )}
            </div>
        </div>
    )
}
