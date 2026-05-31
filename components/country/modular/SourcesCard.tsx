import Link from "next/link"
import { ExternalLink, BookOpen } from "lucide-react"
import { CountryData } from "@/types/country"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"

interface SourcesCardProps {
    data: CountryData
    dict: any
    lang: string
    compact?: boolean
}

export default function SourcesCard({ data, dict, lang, compact = false }: SourcesCardProps) {
    const entries = data.source_entries ?? []
    const fallbackSources = data.sources ?? []
    const hasEntries = entries.length > 0

    return (
        <div className="rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
                <h4 className="font-medium text-white">{dict.rules.sources}</h4>
                <Link
                    href={`/${lang}/country/${data.iso2.toLowerCase()}/sources`}
                    className="text-xs text-violet-400 hover:text-violet-300 inline-flex items-center gap-1"
                >
                    <BookOpen className="h-3.5 w-3.5" />
                    {dict.sources_page.view_all}
                </Link>
            </div>

            {hasEntries ? (
                <ul className={`space-y-3 ${compact ? "max-h-64 overflow-y-auto pr-1" : ""}`}>
                    {entries.slice(0, compact ? 4 : undefined).map((source) => (
                        <li key={source.id} className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-slate-200 hover:text-white inline-flex items-center gap-1.5"
                                    >
                                        {source.title}
                                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                    </a>
                                    {source.publisher && (
                                        <p className="text-xs text-slate-500 mt-1">{source.publisher}</p>
                                    )}
                                </div>
                                <span className="shrink-0 rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                                    {TRUST_LEVEL_LABELS[source.trustLevel]}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-2">
                                {SOURCE_TYPE_LABELS[source.sourceType]}
                                {source.moduleKey ? ` · ${source.moduleKey}` : ""}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="space-y-1 text-sm text-slate-500">
                    {fallbackSources.length > 0 ? fallbackSources.map((s, i) => (
                        <li key={i}>
                            {s.startsWith("http") ? (
                                <a href={s} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">
                                    {s}
                                </a>
                            ) : (
                                s
                            )}
                        </li>
                    )) : (
                        <li>{dict.common.official_highway_code}</li>
                    )}
                </ul>
            )}
        </div>
    )
}
