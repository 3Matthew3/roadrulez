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
import CountrySectionHero, { PAGE_BG } from "@/components/country/country-section-hero"
import CountrySubnav from "@/components/country/country-subnav"
import { cn } from "@/lib/utils"
import { getCountryTheme, usesPremiumCountryLayout } from "@/lib/country-theme"
import type { CountrySourceEntry } from "@/types/source"
import {
    filterSourcesByStatsFilter,
    formatSourceDate,
    getPublicSourceBadgeClass,
    getPublicSourceBadgeLabel,
    getSourceStats,
    getSourceUsageLabelKeys,
    getTrustDisplay,
    groupSources,
    isOfficialGovernmentSource,
    matchesSourceSearch,
    shouldGroupSources,
    sortSourcesForDisplay,
    type SourceGroup,
    type SourceStatsFilter,
} from "@/lib/source-display"

interface CountrySourcesViewProps {
    countryName: string
    countryIso2: string
    lang: string
    lastVerified?: string
    sources: CountrySourceEntry[]
    labels: Record<string, string>
    localizedName?: string
    headerImages?: string[]
    navLabels?: Record<string, string>
    hasFaq?: boolean
    hasFines?: boolean
    heroLabels?: Record<string, string>
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
        <span className="inline-flex items-center gap-1.5 text-sm text-[#64748B] dark:text-slate-300">
            <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
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
                    : "border-[#E2E8F0] bg-[#F8FAFC] dark:border-slate-800 dark:bg-slate-900/40"
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        {isOfficial && (
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300">
                                <Building2 className="h-4 w-4" />
                            </div>
                        )}
                        <div className="min-w-0 space-y-1">
                            <h2 className="text-lg font-semibold leading-snug text-[#0F172A] dark:text-white">{source.title}</h2>
                            {source.publisher && (
                                <p className="text-sm text-[#64748B] dark:text-slate-400">{source.publisher}</p>
                            )}
                            <TrustIndicator icon={trust.icon} label={labels[trust.labelKey]} />
                        </div>
                    </div>
                </div>

                <span
                    className={cn(
                        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
                        getPublicSourceBadgeClass(source)
                    )}
                >
                    {getPublicSourceBadgeLabel(source, labels)}
                </span>
            </div>

            {source.notes && (
                <p className="mt-3 text-sm leading-relaxed text-[#64748B] dark:text-slate-400">{source.notes}</p>
            )}

            {(verifiedMonth || checkedDate) && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#94A3B8] dark:text-slate-500">
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
                <div className="mt-3 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] p-3 dark:border-slate-800 dark:bg-slate-950/40">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-500">
                        {labels.used_for}
                    </p>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {usageKeys.map((key) => (
                            <li key={key} className="flex items-center gap-1.5 text-sm text-[#334155] dark:text-slate-300">
                                <Check className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400/80" />
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

function StatFilterButton({
    active,
    count,
    label,
    countClassName,
    onClick,
}: {
    active: boolean
    count: number
    label: string
    countClassName: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155] dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-300",
                active && "bg-[#F1F5F9] text-[#0F172A] ring-1 ring-blue-500/35 dark:bg-slate-800 dark:text-slate-200"
            )}
        >
            <span className={cn("font-semibold", active ? "text-[#0F172A] dark:text-white" : countClassName)}>{count}</span>{" "}
            {label}
        </button>
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
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B] dark:text-slate-500">
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
    localizedName,
    headerImages,
    navLabels,
    hasFaq = false,
    hasFines = false,
    heroLabels,
}: CountrySourcesViewProps) {
    const [query, setQuery] = useState("")
    const [statFilter, setStatFilter] = useState<SourceStatsFilter>("all")
    const premium = usesPremiumCountryLayout(countryIso2)
    const theme = getCountryTheme(countryIso2)
    const displayName = localizedName ?? countryName

    const sortedSources = useMemo(() => sortSourcesForDisplay(sources), [sources])
    const stats = useMemo(() => getSourceStats(sortedSources), [sortedSources])

    const filteredSources = useMemo(() => {
        let result = filterSourcesByStatsFilter(sortedSources, statFilter)
        const trimmed = query.trim()
        if (trimmed) {
            result = result.filter((source) => matchesSourceSearch(source, trimmed))
        }
        return result
    }, [query, statFilter, sortedSources])

    const setStatFilterToggle = (next: SourceStatsFilter) => {
        setStatFilter((current) => (current === next ? "all" : next))
    }

    const useGrouping = shouldGroupSources(filteredSources)
    const groupedSources = useMemo(() => groupSources(filteredSources), [filteredSources])

    const listContent = (
        <>
            {!premium && (
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
                </div>
            )}

            {premium && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white">{labels.country_title.replace("{country}", displayName)}</h2>
                    <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">{labels.country_subtitle}</p>
                </div>
            )}

            {stats.total > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    <StatFilterButton
                        active={statFilter === "all"}
                        count={stats.total}
                        label={labels.stats_total}
                        countClassName="text-[#0F172A] dark:text-slate-200"
                        onClick={() => setStatFilter("all")}
                    />
                    <StatFilterButton
                        active={statFilter === "official"}
                        count={stats.official}
                        label={labels.stats_official}
                        countClassName="text-blue-600 dark:text-blue-300"
                        onClick={() => setStatFilterToggle("official")}
                    />
                    <StatFilterButton
                        active={statFilter === "supplementary"}
                        count={stats.supplementary}
                        label={labels.stats_supplementary}
                        countClassName="text-[#475569] dark:text-slate-300"
                        onClick={() => setStatFilterToggle("supplementary")}
                    />
                </div>
            )}

            {sortedSources.length > 0 && (
                <div className="relative mb-6">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] dark:text-slate-500" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={labels.search_placeholder}
                        className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                </div>
            )}

            {sortedSources.length === 0 ? (
                <p className="text-[#64748B] dark:text-slate-500">{labels.empty}</p>
            ) : filteredSources.length === 0 ? (
                <p className="text-[#64748B] dark:text-slate-500">{labels.no_results}</p>
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
        </>
    )

    if (premium && navLabels) {
        return (
            <div
                className={cn("min-h-screen", PAGE_BG)}
                style={
                    {
                        "--country-accent": theme.accent,
                    } as React.CSSProperties
                }
            >
                <CountrySectionHero
                    lang={lang}
                    localizedName={displayName}
                    countryName={countryName}
                    countryIso2={countryIso2}
                    headerImages={headerImages}
                    breadcrumbHome={heroLabels?.breadcrumb_home ?? "Home"}
                    breadcrumbCurrent={navLabels.nav_sources}
                    title={labels.country_title.replace("{country}", displayName)}
                    subtitle={labels.country_subtitle}
                    lastVerified={lastVerified}
                    verifiedLabel={heroLabels?.verified_on ?? labels.verified_on ?? "Verified"}
                    sourceCount={stats.total}
                    sourcesBadgeLabel={
                        heroLabels?.sources_count?.replace("{count}", String(stats.total)) ??
                        `${stats.total} sources`
                    }
                />
                <CountrySubnav
                    lang={lang}
                    countryIso2={countryIso2}
                    active="sources"
                    labels={navLabels}
                    hasFaq={hasFaq}
                    hasFines={hasFines}
                    accentColor={theme.accent}
                />
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">{listContent}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200">
            <div className="container mx-auto max-w-5xl px-4 py-10 md:px-6">
                {listContent}
            </div>
        </div>
    )
}
