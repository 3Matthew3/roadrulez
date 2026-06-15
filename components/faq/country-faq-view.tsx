"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import {
    BookOpen,
    ChevronRight,
    ExternalLink,
    Gavel,
    Minus,
    Plus,
    Search,
    ShieldCheck,
} from "lucide-react"
import CountrySectionHero, { PAGE_BG } from "@/components/country/country-section-hero"
import CountrySubnav from "@/components/country/country-subnav"
import { cn } from "@/lib/utils"
import { COUNTRY_CARD } from "@/lib/country-premium-styles"
import { getCountryTheme } from "@/lib/country-theme"
import {
    FAQ_CATEGORY_IDS,
    FAQ_CATEGORY_LABEL_KEYS,
    countFaqsByCategory,
    filterFaqs,
    formatFaqResultsCount,
    resolveFaqSourceLinks,
    resolveFaqText,
    resolveRelatedLabel,
} from "@/lib/faq-display"
import type { CountryFaqEntry, FaqCategoryId } from "@/types/country"
import type { CountrySourceEntry } from "@/types/source"

interface CountryFaqViewProps {
    countryName: string
    localizedName: string
    countryIso2: string
    lang: string
    headerImages?: string[]
    lastVerified?: string
    faqEntries: CountryFaqEntry[]
    sourceEntries: CountrySourceEntry[]
    labels: Record<string, string>
    navLabels: Record<string, string>
    hasFines?: boolean
}

const CARD_CLASS = cn(COUNTRY_CARD, "shadow-sm dark:shadow-lg dark:shadow-black/20")

function resolveHref(href: string | undefined, lang: string) {
    if (!href) return undefined
    if (href.startsWith("http")) return href
    const path = href.startsWith("/") ? href : `/${href}`
    return `/${lang}${path}`
}

function CategoryPill({
    active,
    label,
    count,
    onClick,
    accentColor,
}: {
    active: boolean
    label: string
    count: number
    onClick: () => void
    accentColor: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active
                    ? "text-white shadow-sm"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A] dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
            )}
            style={
                active
                    ? {
                          borderColor: `${accentColor}80`,
                          backgroundColor: `${accentColor}1A`,
                          boxShadow: `0 1px 2px ${accentColor}1A`,
                      }
                    : undefined
            }
        >
            {label}
            <span
                className={cn("ml-1.5 tabular-nums", active ? "" : "text-slate-500")}
                style={active ? { color: accentColor } : undefined}
            >
                {count}
            </span>
        </button>
    )
}

function RelatedBadge({
    children,
    href,
    external,
}: {
    children: React.ReactNode
    href?: string
    external?: boolean
}) {
    const className = cn(
        "inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1",
        "text-xs font-medium text-slate-300 transition-colors",
        href && "hover:border-slate-600 hover:bg-slate-800 hover:text-white"
    )

    if (!href) {
        return <span className={className}>{children}</span>
    }

    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {children}
                <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
        )
    }

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    )
}

function FaqAccordionItem({
    entry,
    lang,
    labels,
    sourceEntries,
}: {
    entry: CountryFaqEntry
    lang: string
    labels: Record<string, string>
    sourceEntries: CountrySourceEntry[]
}) {
    const { question, answer } = resolveFaqText(entry, lang)
    const value = entry.id ?? question
    const sources = resolveFaqSourceLinks(entry.relatedSourceIds, sourceEntries)

    return (
        <AccordionPrimitive.Item
            value={value}
            className={cn(
                CARD_CLASS,
                "overflow-hidden transition-shadow",
                "hover:border-[#CBD5E1] hover:shadow-md dark:hover:border-slate-600 dark:hover:shadow-md dark:hover:shadow-black/20",
                "data-[state=open]:border-[#CBD5E1] data-[state=open]:shadow-lg dark:data-[state=open]:border-slate-600 dark:data-[state=open]:shadow-lg dark:data-[state=open]:shadow-black/25"
            )}
        >
            <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                    className={cn(
                        "group flex flex-1 items-start justify-between gap-4 px-5 py-5 text-left md:px-6 md:py-6",
                        "transition-colors hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40",
                        "[&[data-state=open]]:bg-[#F8FAFC] dark:[&[data-state=open]]:bg-slate-800/30"
                    )}
                >
                    <span className="text-base font-semibold leading-snug text-[#0F172A] dark:text-white md:text-lg">
                        {question}
                    </span>
                    <span
                        className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B] transition-colors",
                            "group-hover:border-[#94A3B8] group-data-[state=open]:border-[color:var(--country-accent)]",
                            "group-data-[state=open]:bg-[color:var(--country-accent-muted)] group-data-[state=open]:text-[color:var(--country-accent)]",
                            "dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400 dark:group-hover:border-slate-500"
                        )}
                    >
                        <Plus className="h-4 w-4 group-data-[state=open]:hidden" aria-hidden="true" />
                        <Minus className="hidden h-4 w-4 group-data-[state=open]:block" aria-hidden="true" />
                    </span>
                </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>

            <AccordionPrimitive.Content className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-5 border-t border-slate-700/80 px-5 pb-6 pt-5 md:px-6">
                    <p className="text-base leading-relaxed text-slate-300">{answer}</p>

                    {(entry.relatedRules?.length ||
                        entry.relatedFines?.length ||
                        sources.length > 0) && (
                        <div className="space-y-4 rounded-xl border border-slate-700/80 bg-slate-900/40 p-4">
                            {entry.relatedRules && entry.relatedRules.length > 0 && (
                                <div>
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        {labels.related_rules}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {entry.relatedRules.map((link) => (
                                            <RelatedBadge
                                                key={link.label}
                                                href={resolveHref(link.href, lang)}
                                            >
                                                {resolveRelatedLabel(link, lang)}
                                            </RelatedBadge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {entry.relatedFines && entry.relatedFines.length > 0 && (
                                <div>
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        {labels.related_fines}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {entry.relatedFines.map((link) => (
                                            <RelatedBadge
                                                key={link.label}
                                                href={resolveHref(link.href, lang)}
                                            >
                                                {resolveRelatedLabel(link, lang)}
                                            </RelatedBadge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sources.length > 0 && (
                                <div>
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        {labels.related_sources}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {sources.map((source) => (
                                            <RelatedBadge key={source.id} href={source.url} external>
                                                {source.publisher ?? source.title}
                                            </RelatedBadge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
    )
}

function NavCard({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string
    icon: typeof BookOpen
    title: string
    description: string
}) {
    return (
        <Link
            href={href}
            className={cn(
                CARD_CLASS,
                "group flex flex-col p-6 transition-all",
                "hover:border-[#CBD5E1] hover:shadow-lg dark:hover:border-slate-600 dark:hover:shadow-lg dark:hover:shadow-black/20"
            )}
        >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 text-slate-300 transition-colors group-hover:border-[color:var(--country-accent)] group-hover:border-opacity-30 group-hover:text-[color:var(--country-accent)]">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{description}</p>
            <ChevronRight className="mt-4 h-5 w-5 text-[#3B82F6] transition-transform group-hover:translate-x-0.5" />
        </Link>
    )
}

export default function CountryFaqView({
    countryName,
    localizedName,
    countryIso2,
    lang,
    headerImages,
    lastVerified,
    faqEntries,
    sourceEntries,
    labels,
    navLabels,
    hasFines = false,
}: CountryFaqViewProps) {
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState<FaqCategoryId | "all">("all")

    const categoryCounts = useMemo(() => countFaqsByCategory(faqEntries), [faqEntries])

    const filteredEntries = useMemo(
        () => filterFaqs(faqEntries, category, query, lang),
        [faqEntries, category, query, lang]
    )

    const countryPath = `/${lang}/country/${countryIso2.toLowerCase()}`
    const pageTitle = labels.page_title.replace("{country}", localizedName)
    const pageSubtitle = labels.page_subtitle.replace("{country}", localizedName)
    const sourceCount = sourceEntries.length
    const theme = getCountryTheme(countryIso2)

    return (
        <div
            className={cn("min-h-screen", PAGE_BG)}
            style={
                {
                    "--country-accent": theme.accent,
                    "--country-accent-muted": theme.accentMuted,
                    "--country-accent-dark": theme.accentDark,
                } as React.CSSProperties
            }
        >
            <CountrySectionHero
                lang={lang}
                localizedName={localizedName}
                countryName={countryName}
                countryIso2={countryIso2}
                headerImages={headerImages}
                breadcrumbHome={labels.breadcrumb_home}
                breadcrumbCurrent={labels.breadcrumb_faq}
                title={pageTitle}
                subtitle={pageSubtitle}
                lastVerified={lastVerified}
                verifiedLabel={labels.verified_on}
                sourceCount={sourceCount}
                sourcesBadgeLabel={labels.sources_count}
            />

            <CountrySubnav
                lang={lang}
                countryIso2={countryIso2}
                active="faq"
                labels={navLabels}
                hasFaq
                hasFines={hasFines}
                accentColor={theme.accent}
            />

            {/* Search & filters */}
            <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
                <div className="relative mb-8 mt-8">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={labels.search_placeholder}
                        className={cn(
                            CARD_CLASS,
                            "h-14 w-full pl-12 pr-4 text-base text-[#0F172A] dark:text-slate-100",
                            "placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:border-[color:var(--country-accent)] focus:ring-[color:var(--country-accent)] focus:ring-opacity-20 dark:placeholder:text-slate-500"
                        )}
                    />
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-400">
                        {formatFaqResultsCount(filteredEntries.length, labels)}
                    </p>
                </div>

                <div className="mb-10 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <CategoryPill
                        active={category === "all"}
                        label={labels.category_all}
                        count={categoryCounts.all}
                        onClick={() => setCategory("all")}
                        accentColor={theme.accent}
                    />
                    {FAQ_CATEGORY_IDS.map((id) => (
                        <CategoryPill
                            key={id}
                            active={category === id}
                            label={labels[FAQ_CATEGORY_LABEL_KEYS[id]] ?? id}
                            count={categoryCounts[id]}
                            onClick={() => setCategory(id)}
                            accentColor={theme.accent}
                        />
                    ))}
                </div>

                {/* FAQ list */}
                {filteredEntries.length === 0 ? (
                    <div className={cn(CARD_CLASS, "px-6 py-16 text-center")}>
                        <p className="text-slate-400">{labels.no_results}</p>
                    </div>
                ) : (
                    <AccordionPrimitive.Root type="single" collapsible className="space-y-3">
                        {filteredEntries.map((entry) => (
                            <FaqAccordionItem
                                key={entry.id ?? entry.question}
                                entry={entry}
                                lang={lang}
                                labels={labels}
                                sourceEntries={sourceEntries}
                            />
                        ))}
                    </AccordionPrimitive.Root>
                )}

                {/* Helpful navigation */}
                <section className="mt-16 border-t border-slate-800 pt-14 pb-16">
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-3xl">
                        {labels.still_looking}
                    </h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <NavCard
                            href={countryPath}
                            icon={BookOpen}
                            title={labels.nav_rules_title.replace("{country}", localizedName)}
                            description={labels.nav_rules_desc}
                        />
                        <NavCard
                            href={`${countryPath}/fines`}
                            icon={Gavel}
                            title={labels.nav_fines_title.replace("{country}", localizedName)}
                            description={labels.nav_fines_desc}
                        />
                        <NavCard
                            href={`${countryPath}/sources`}
                            icon={ShieldCheck}
                            title={labels.nav_sources_title}
                            description={labels.nav_sources_desc}
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}
