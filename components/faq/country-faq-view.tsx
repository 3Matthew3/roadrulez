"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import {
    ArrowLeft,
    BookOpen,
    ChevronRight,
    ExternalLink,
    Gavel,
    Minus,
    Plus,
    Search,
    ShieldCheck,
} from "lucide-react"
import HeroImage from "@/components/country/hero-image"
import { cn } from "@/lib/utils"
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
    faqEntries: CountryFaqEntry[]
    sourceEntries: CountrySourceEntry[]
    labels: Record<string, string>
}

const PAGE_BG = "#0B1120"
const CARD_BG = "#1E293B"

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
}: {
    active: boolean
    label: string
    count: number
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active
                    ? "border-[#F87171]/50 bg-[#F87171]/10 text-white shadow-sm shadow-[#F87171]/10"
                    : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200"
            )}
        >
            {label}
            <span className={cn("ml-1.5 tabular-nums", active ? "text-[#F87171]" : "text-slate-500")}>
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
                "overflow-hidden rounded-2xl border border-slate-700 shadow-sm transition-shadow",
                "hover:border-slate-600 hover:shadow-md hover:shadow-black/20",
                "data-[state=open]:border-slate-600 data-[state=open]:shadow-lg data-[state=open]:shadow-black/25"
            )}
            style={{ backgroundColor: CARD_BG }}
        >
            <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                    className={cn(
                        "group flex flex-1 items-start justify-between gap-4 px-5 py-5 text-left md:px-6 md:py-6",
                        "transition-colors hover:bg-slate-800/40",
                        "[&[data-state=open]]:bg-slate-800/30"
                    )}
                >
                    <span className="text-base font-semibold leading-snug text-white md:text-lg">
                        {question}
                    </span>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/50 text-slate-400 transition-colors group-hover:border-slate-500 group-data-[state=open]:border-[#F87171]/40 group-data-[state=open]:bg-[#F87171]/10 group-data-[state=open]:text-[#F87171]">
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
                "group flex flex-col rounded-2xl border border-slate-700 p-6 transition-all",
                "hover:border-slate-600 hover:shadow-lg hover:shadow-black/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F87171]/40"
            )}
            style={{ backgroundColor: CARD_BG }}
        >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 text-slate-300 transition-colors group-hover:border-[#F87171]/30 group-hover:text-[#F87171]">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
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
    faqEntries,
    sourceEntries,
    labels,
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
    const backLabel = labels.back_to_guide.replace("{country}", localizedName)

    return (
        <div className="min-h-screen text-slate-100" style={{ backgroundColor: PAGE_BG }}>
            {/* Hero */}
            <div className="relative min-h-[420px] w-full overflow-hidden md:min-h-[480px]">
                <div className="absolute inset-0 z-0 bg-[#111]">
                    <HeroImage name={countryName} images={headerImages} />
                    <div
                        className="absolute inset-0 z-10"
                        style={{
                            background:
                                "linear-gradient(to top, #0B1120 0%, rgba(11,17,32,0.85) 45%, rgba(0,0,0,0.35) 100%)",
                        }}
                    />
                </div>

                <div className="relative z-20 mx-auto flex h-full min-h-[420px] w-full max-w-6xl flex-col px-4 pb-10 pt-8 md:min-h-[480px] md:px-6 md:pb-14 md:pt-10">
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
                            <li>
                                <Link href={`/${lang}`} className="transition-colors hover:text-white">
                                    {labels.breadcrumb_home}
                                </Link>
                            </li>
                            <li aria-hidden="true" className="text-slate-600">
                                /
                            </li>
                            <li>
                                <Link href={countryPath} className="transition-colors hover:text-white">
                                    {localizedName}
                                </Link>
                            </li>
                            <li aria-hidden="true" className="text-slate-600">
                                /
                            </li>
                            <li className="font-medium text-slate-200">{labels.breadcrumb_faq}</li>
                        </ol>
                    </nav>

                    <div className="mt-auto max-w-3xl">
                        <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl md:leading-tight">
                            {pageTitle}
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-slate-300 md:text-lg">
                            {pageSubtitle}
                        </p>
                        <Link
                            href={countryPath}
                            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/70 px-5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-slate-500 hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {backLabel}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search & filters */}
            <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
                <div className="relative -mt-6 mb-8">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={labels.search_placeholder}
                        className={cn(
                            "h-14 w-full rounded-2xl border border-slate-700 pl-12 pr-4 text-base text-slate-100 shadow-lg shadow-black/20",
                            "placeholder:text-slate-500 focus:border-[#F87171]/40 focus:outline-none focus:ring-2 focus:ring-[#F87171]/20"
                        )}
                        style={{ backgroundColor: CARD_BG }}
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
                    />
                    {FAQ_CATEGORY_IDS.map((id) => (
                        <CategoryPill
                            key={id}
                            active={category === id}
                            label={labels[FAQ_CATEGORY_LABEL_KEYS[id]] ?? id}
                            count={categoryCounts[id]}
                            onClick={() => setCategory(id)}
                        />
                    ))}
                </div>

                {/* FAQ list */}
                {filteredEntries.length === 0 ? (
                    <div
                        className="rounded-2xl border border-slate-700 px-6 py-16 text-center"
                        style={{ backgroundColor: CARD_BG }}
                    >
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
                    <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
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
                            href={countryPath}
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
