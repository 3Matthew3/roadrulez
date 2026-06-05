"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
    ArrowLeft,
    Building2,
    Check,
    ExternalLink,
    Info,
    Search,
    ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CountrySourceEntry } from "@/types/source"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"
import {
    formatSourceDate,
    getSourceStats,
    getSourceTypeBadgeClass,
    getSourceUsageLabelKeys,
    getTrustBadgeClass,
    getTrustDisplay,
    groupSources,
    isOfficialGovernmentSource,
    matchesSourceSearch,
    shouldGroupSources,
    sortSourcesForDisplay,
    type SourceGroup,
} from "@/lib/source-display"

interface CountrySourcesViewProps {
    countryName: string
    countryIso2: string
    lang: string
    lastVerified?: string
    sources: CountrySourceEntry[]
    labels: Record<string, string>
}

function TrustIndicator({
    icon,
    label,
}: {
    icon: "shield" | "check" | "info"
    label: string
}) {
    const Icon = icon === "shield" ? ShieldCheck : icon === "check" ? Check : Info

    return (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
            <Icon className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>{label}</span>
        </span>
    )
}

function SourceCard({
    source,
    labels,
    lang,
    lastVerified,
}: {
    source: CountrySourceEntry
    labels: Record<string, string>
    lang: string
    lastVerified?: string
}) {
    const trust = getTrustDisplay(source)
    const isOfficial = isOfficialGovernmentSource(source)
    const usageKeys = getSourceUsageLabelKeys(source)
    const checkedDate = formatSourceDate(source.lastCheckedAt, lang, "day")
    const verifiedMonth = formatSourceDate(source.lastCheckedAt ?? lastVerified, lang, "month")

    return (
        <article
            className={cn(
                "rounded-xl border p-4 transition-colors",
                isOfficial
                    ? "border-blue-500/35 bg-blue-500/[0.06] shadow-sm shadow-blue-500/10"
                    : "border-slate-800 bg-slate-900/40"
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        {isOfficial && (
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300">
                                <Building2 className="h-4 w-4" />
                            </div>
                        )}
                        <div className="min-w-0 space-y-1">
                            <h2 className="text-lg font-semibold leading-snug text-white">{source.title}</h2>
                            {source.publisher && (
                                <p className="text-sm text-slate-400">{source.publisher}</p>
                            )}
                            <TrustIndicator icon={trust.icon} label={labels[trust.labelKey]} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span
                        className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-medium",
                            getTrustBadgeClass(source.trustLevel)
                        )}
                    >
                        {TRUST_LEVEL_LABELS[source.trustLevel]}
                    </span>
                    <span
                        className={cn(
                            "rounded-full border px-2.5 py-1 text-xs",
                            getSourceTypeBadgeClass(source.sourceType)
                        )}
                    >
                        {SOURCE_TYPE_LABELS[source.sourceType]}
                    </span>
                </div>
            </div>

            {source.notes && (
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{source.notes}</p>
            )}

            {(verifiedMonth || checkedDate) && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {verifiedMonth && (
                        <span>
                            {labels.verified_on}: {verifiedMonth}
                        </span>
                    )}
                    {checkedDate && (
                        <span>
                            {labels.last_checked}: {checkedDate}
                        </span>
                    )}
                </div>
            )}

            {usageKeys.length > 0 && (
                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {labels.used_for}
                    </p>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {usageKeys.map((key) => (
                            <li key={key} className="flex items-center gap-1.5 text-sm text-slate-300">
                                <Check className="h-3 w-3 shrink-0 text-emerald-400/80" />
                                <span>
                                    {labels[key] ??
                                        key
                                            .replace(/^usage_/, "")
                                            .replace(/_/g, " ")}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-4 flex justify-end">
                <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3B82F6]"
                >
                    {labels.open_source}
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>
        </article>
    )
}

function SourceList({
    sources,
    labels,
    lang,
    lastVerified,
}: {
    sources: CountrySourceEntry[]
    labels: Record<string, string>
    lang: string
    lastVerified?: string
}) {
    return (
        <div className="grid gap-3">
            {sources.map((source) => (
                <SourceCard
                    key={source.id}
                    source={source}
                    labels={labels}
                    lang={lang}
                    lastVerified={lastVerified}
                />
            ))}
        </div>
    )
}

function GroupedSourceList({
    groups,
    labels,
    lang,
    lastVerified,
}: {
    groups: SourceGroup[]
    labels: Record<string, string>
    lang: string
    lastVerified?: string
}) {
    return (
        <div className="space-y-8">
            {groups.map((group) => (
                <section key={group.id}>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {labels[group.labelKey]}
                    </h2>
                    <SourceList
                        sources={group.sources}
                        labels={labels}
                        lang={lang}
                        lastVerified={lastVerified}
                    />
                </section>
            ))}
        </div>
    )
}

export default function CountrySourcesView({
    countryName,
    countryIso2,
    lang,
    lastVerified,
    sources,
    labels,
}: CountrySourcesViewProps) {
    const [query, setQuery] = useState("")

    const sortedSources = useMemo(() => sortSourcesForDisplay(sources), [sources])
    const stats = useMemo(() => getSourceStats(sortedSources), [sortedSources])

    const filteredSources = useMemo(() => {
        const trimmed = query.trim()
        if (!trimmed) return sortedSources
        return sortedSources.filter((source) => matchesSourceSearch(source, trimmed))
    }, [query, sortedSources])

    const useGrouping = shouldGroupSources(filteredSources)
    const groupedSources = useMemo(() => groupSources(filteredSources), [filteredSources])

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200">
            <div className="container mx-auto max-w-5xl px-4 py-10 md:px-6">
                <div className="mb-8">
                    <Link
                        href={`/${lang}/country/${countryIso2.toLowerCase()}`}
                        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {labels.back_to_country.replace("{country}", countryName)}
                    </Link>

                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        {labels.country_title.replace("{country}", countryName)}
                    </h1>
                    <p className="mt-2 max-w-3xl text-slate-400">{labels.country_subtitle}</p>

                    {stats.total > 0 && (
                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                            <span>
                                <span className="font-semibold text-slate-200">{stats.total}</span>{" "}
                                {labels.stats_total}
                            </span>
                            <span>
                                <span className="font-semibold text-blue-300">{stats.official}</span>{" "}
                                {labels.stats_official}
                            </span>
                            <span>
                                <span className="font-semibold text-slate-300">{stats.supplementary}</span>{" "}
                                {labels.stats_supplementary}
                            </span>
                        </div>
                    )}
                </div>

                {sortedSources.length > 0 && (
                    <div className="relative mb-6">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={labels.search_placeholder}
                            className="h-11 w-full rounded-lg border border-slate-700 bg-slate-900/70 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                )}

                {sortedSources.length === 0 ? (
                    <p className="text-slate-500">{labels.empty}</p>
                ) : filteredSources.length === 0 ? (
                    <p className="text-slate-500">{labels.no_results}</p>
                ) : useGrouping ? (
                    <GroupedSourceList
                        groups={groupedSources}
                        labels={labels}
                        lang={lang}
                        lastVerified={lastVerified}
                    />
                ) : (
                    <SourceList
                        sources={filteredSources}
                        labels={labels}
                        lang={lang}
                        lastVerified={lastVerified}
                    />
                )}
            </div>
        </div>
    )
}
