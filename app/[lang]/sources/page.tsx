import Link from "next/link"
import { getAllPublicSources } from "@/lib/sources"
import { getDictionary } from "@/lib/dictionaries"
import { ExternalLink } from "lucide-react"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"

interface PageProps {
    params: { lang: string }
}

export default async function SourcesIndexPage({ params }: PageProps) {
    const [sources, dict] = await Promise.all([
        getAllPublicSources(),
        getDictionary(params.lang),
    ])

    return (
        <div className="min-h-screen bg-[#0a0e17] text-slate-200">
            <div className="container px-4 md:px-6 py-10 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">{dict.sources_page.index_title}</h1>
                    <p className="text-slate-400 mt-2">{dict.sources_page.index_subtitle}</p>
                </div>

                {sources.length === 0 ? (
                    <p className="text-slate-500">{dict.sources_page.empty}</p>
                ) : (
                    <div className="grid gap-4">
                        {sources.map((source) => (
                            <article key={source.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            {source.country?.flag} {source.country?.name}
                                            {source.country && (
                                                <>
                                                    {" · "}
                                                    <Link
                                                        href={`/${params.lang}/country/${source.country.iso2.toLowerCase()}/sources`}
                                                        className="hover:text-slate-300"
                                                    >
                                                        {dict.sources_page.view_country_sources}
                                                    </Link>
                                                </>
                                            )}
                                        </p>
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
                                <div className="mt-4">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300"
                                    >
                                        {dict.sources_page.open_source}
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
