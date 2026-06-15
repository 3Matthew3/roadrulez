"use client"

import { useMemo, useState } from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import {
    AlertTriangle,
    Car,
    Check,
    ExternalLink,
    Gauge,
    Gavel,
    Minus,
    Plus,
    Smartphone,
    Wine,
} from "lucide-react"
import CountrySectionHero, { PAGE_BG } from "@/components/country/country-section-hero"
import CountrySubnav from "@/components/country/country-subnav"
import { cn } from "@/lib/utils"
import { COUNTRY_CARD } from "@/lib/country-premium-styles"
import { getCountryTheme } from "@/lib/country-theme"
import {
    CONSEQUENCE_LABEL_KEYS,
    FINE_CATEGORY_LABEL_KEYS,
    FINE_CATEGORY_ORDER,
    getActiveConsequences,
    resolveCategoryDescription,
    resolveCategoryTitle,
    resolveFineAmount,
    resolveFinesSources,
    resolveRowLabel,
    resolveSummaryMax,
    resolveSummaryText,
    resolveSummaryTitle,
    resolveSuspension,
    VEHICLE_LABEL_KEYS,
} from "@/lib/fines-display"
import {
    formatSourceDate,
    getPublicSourceBadgeClass,
    getPublicSourceBadgeLabel,
    isOfficialGovernmentSource,
} from "@/lib/source-display"
import type {
    CountryFineCategory,
    CountryFineConsequence,
    CountryFineRow,
    CountryFineSummary,
    CountryTrafficFinesData,
    FineVehicleApplicability,
} from "@/types/country"
import type { CountrySourceEntry } from "@/types/source"

const CARD_CLASS = cn(COUNTRY_CARD, "shadow-sm dark:shadow-lg dark:shadow-black/20")

interface CountryFinesViewProps {
    countryName: string
    localizedName: string
    countryIso2: string
    lang: string
    headerImages?: string[]
    lastVerified?: string
    finesData: CountryTrafficFinesData
    sourceEntries: CountrySourceEntry[]
    labels: Record<string, string>
    sourceLabels: Record<string, string>
    navLabels: Record<string, string>
}

const SUMMARY_ICONS = {
    speed: Gauge,
    phone: Smartphone,
    red_light: AlertTriangle,
    alcohol: Wine,
} as const

function ApplicabilityTags({
    appliesTo,
    labels,
}: {
    appliesTo: FineVehicleApplicability[]
    labels: Record<string, string>
}) {
    const all: FineVehicleApplicability[] = ["car", "motorcycle", "moped"]
    const onlyOne = appliesTo.length === 1

    return (
        <div className="flex flex-wrap gap-1.5">
            {all.map((vehicle) => {
                const active = appliesTo.includes(vehicle)
                if (!active) return null

                return (
                    <span
                        key={vehicle}
                        className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
                            onlyOne
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                                : "border-[#CBD5E1] bg-[#F1F5F9] text-[#475569] dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
                        )}
                    >
                        <Check className="h-3 w-3 shrink-0" />
                        {onlyOne && vehicle !== "car"
                            ? labels[`${VEHICLE_LABEL_KEYS[vehicle]}_only`] ??
                              `${labels[VEHICLE_LABEL_KEYS[vehicle]]} only`
                            : labels[VEHICLE_LABEL_KEYS[vehicle]]}
                    </span>
                )
            })}
        </div>
    )
}

function ConsequenceBadges({
    consequences,
    labels,
    lang,
}: {
    consequences: CountryFineConsequence
    labels: Record<string, string>
    lang: string
}) {
    const active = getActiveConsequences(consequences)
    const fine = resolveFineAmount(consequences, lang)
    const suspension = resolveSuspension(consequences, lang)
    const points = consequences.points

    return (
        <div className="flex flex-wrap gap-1.5">
            {active.includes("fine") && fine && (
                <span className="rounded-md border border-[#CBD5E1] bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#334155] dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200">
                    {labels.consequence_fine}: {fine}
                </span>
            )}
            {active.includes("points") && points !== undefined && points !== null && points !== "" && (
                <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                    {labels.consequence_points}: {points}
                </span>
            )}
            {active.includes("license_suspension") && suspension && (
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                    {labels.consequence_suspension}: {suspension}
                </span>
            )}
            {active.includes("vehicle_impound") && (
                <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-200">
                    {labels[CONSEQUENCE_LABEL_KEYS.vehicle_impound]}
                </span>
            )}
            {active.includes("vehicle_confiscation") && (
                <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-200">
                    {labels[CONSEQUENCE_LABEL_KEYS.vehicle_confiscation]}
                </span>
            )}
            {active.includes("court") && (
                <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
                    {labels[CONSEQUENCE_LABEL_KEYS.court]}
                </span>
            )}
        </div>
    )
}

function SpeedingTable({
    rows,
    labels,
    lang,
}: {
    rows: CountryFineRow[]
    labels: Record<string, string>
    lang: string
}) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-slate-700">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] dark:border-slate-700 dark:bg-slate-900/60">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                            {labels.table_speed_over}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                            {labels.table_fine}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                            {labels.table_points}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                            {labels.table_suspension}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                            {labels.table_confiscation}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const { consequences } = row
                        const fine = resolveFineAmount(consequences, lang)
                        const suspension = resolveSuspension(consequences, lang)
                        const points =
                            consequences.points !== undefined &&
                            consequences.points !== null &&
                            consequences.points !== ""
                                ? String(consequences.points)
                                : "—"
                        const confiscation = consequences.vehicleConfiscation
                            ? labels.yes_label
                            : "—"

                        return (
                            <tr
                                key={row.id}
                                className={cn(
                                    "border-b border-[#E2E8F0] last:border-0 dark:border-slate-700/80",
                                    row.severe && "bg-red-500/[0.06]"
                                )}
                            >
                                <td className="px-4 py-3.5 font-semibold text-[#0F172A] dark:text-white">
                                    {resolveRowLabel(row, lang)}
                                </td>
                                <td className="px-4 py-3.5 text-[#334155] dark:text-slate-200">{fine || "—"}</td>
                                <td className="px-4 py-3.5 text-[#475569] dark:text-slate-300">{points}</td>
                                <td className="px-4 py-3.5 text-[#475569] dark:text-slate-300">{suspension || "—"}</td>
                                <td className="px-4 py-3.5 text-[#475569] dark:text-slate-300">{confiscation}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

function OffenseRow({
    row,
    labels,
    lang,
}: {
    row: CountryFineRow
    labels: Record<string, string>
    lang: string
}) {
    return (
        <div
            className={cn(
                "rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-slate-700/80 dark:bg-slate-900/30",
                row.severe && "border-red-500/25 bg-red-500/[0.04]"
            )}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0F172A] dark:text-white">{resolveRowLabel(row, lang)}</p>
                    <div className="mt-3">
                        <ConsequenceBadges consequences={row.consequences} labels={labels} lang={lang} />
                    </div>
                </div>
                <div className="shrink-0">
                    <ApplicabilityTags appliesTo={row.appliesTo} labels={labels} />
                </div>
            </div>
        </div>
    )
}

function CategorySection({
    category,
    labels,
    lang,
}: {
    category: CountryFineCategory
    labels: Record<string, string>
    lang: string
}) {
    const title = resolveCategoryTitle(category, lang)
    const description = resolveCategoryDescription(category, lang)
    const isSpeeding = category.id === "speeding"

    return (
        <AccordionPrimitive.Item
            value={category.id}
            className={cn(CARD_CLASS, "overflow-hidden")}
        >
            <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                    className={cn(
                        "group flex flex-1 items-start justify-between gap-4 px-5 py-5 text-left md:px-6",
                        "transition-colors hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40",
                        "[&[data-state=open]]:bg-[#F8FAFC] dark:[&[data-state=open]]:bg-slate-800/30"
                    )}
                >
                    <div className="min-w-0">
                        <span className="text-base font-semibold text-[#0F172A] dark:text-white md:text-lg">{title}</span>
                        {description && (
                            <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">{description}</p>
                        )}
                    </div>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B] group-data-[state=open]:border-[color:var(--country-accent)] group-data-[state=open]:bg-[color:var(--country-accent-muted)] group-data-[state=open]:text-[color:var(--country-accent)] dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
                        <Plus className="h-4 w-4 group-data-[state=open]:hidden" />
                        <Minus className="hidden h-4 w-4 group-data-[state=open]:block" />
                    </span>
                </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-4 border-t border-[#E2E8F0] px-5 pb-6 pt-5 dark:border-slate-700 md:px-6">
                    {isSpeeding ? (
                        <>
                            <SpeedingTable rows={category.rows} labels={labels} lang={lang} />
                            <div className="space-y-3 pt-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-500">
                                    {labels.applicability_heading}
                                </p>
                                {category.rows.map((row) => (
                                    <div
                                        key={row.id}
                                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <span className="text-sm text-[#334155] dark:text-slate-300">{resolveRowLabel(row, lang)}</span>
                                        <ApplicabilityTags appliesTo={row.appliesTo} labels={labels} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        category.rows.map((row) => (
                            <OffenseRow key={row.id} row={row} labels={labels} lang={lang} />
                        ))
                    )}
                </div>
            </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
    )
}

function SummaryCard({ summary, labels, lang }: { summary: CountryFineSummary; labels: Record<string, string>; lang: string }) {
    const Icon = SUMMARY_ICONS[summary.icon ?? "speed"] ?? Gavel

    return (
        <article className={cn(CARD_CLASS, "flex flex-col p-5 transition-colors hover:border-[#CBD5E1] dark:hover:border-slate-600")}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[color:var(--country-accent)] dark:border-slate-600 dark:bg-slate-900/60">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">{resolveSummaryTitle(summary, lang)}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[#64748B] dark:text-slate-400">
                {resolveSummaryText(summary, lang)}
            </p>
            <p className="mt-4 border-t border-[#E2E8F0] pt-3 text-xs font-medium uppercase tracking-wide text-[#64748B] dark:border-slate-700 dark:text-slate-500">
                {labels.summary_max_label}
            </p>
            <p className="mt-1 text-sm font-semibold text-[color:var(--country-accent)]">{resolveSummaryMax(summary, lang)}</p>
        </article>
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
    const isOfficial = isOfficialGovernmentSource(source)
    const checkedDate = formatSourceDate(source.lastCheckedAt ?? lastVerified, lang, "day")

    return (
        <article
            className={cn(
                "rounded-xl border p-4",
                isOfficial
                    ? "border-blue-500/30 bg-blue-500/[0.05]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] dark:border-slate-700 dark:bg-slate-900/40"
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#0F172A] dark:text-white">{source.title}</h3>
                    {source.publisher && (
                        <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">{source.publisher}</p>
                    )}
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#94A3B8] dark:text-slate-500">
                    {labels.last_checked}: {checkedDate ?? "—"}
                </span>
                <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3B82F6] hover:underline"
                >
                    {labels.open_source}
                    <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </div>
        </article>
    )
}

export default function CountryFinesView({
    countryName,
    localizedName,
    countryIso2,
    lang,
    headerImages,
    lastVerified,
    finesData,
    sourceEntries,
    labels,
    sourceLabels,
    navLabels,
}: CountryFinesViewProps) {
    const [openCategories, setOpenCategories] = useState<string[]>(["speeding"])

    const categories = useMemo(() => {
        const byId = new Map(finesData.categories.map((c) => [c.id, c]))
        return FINE_CATEGORY_ORDER.map((id) => byId.get(id)).filter(
            (c): c is CountryFineCategory => Boolean(c)
        )
    }, [finesData.categories])

    const relatedSources = useMemo(
        () => resolveFinesSources(finesData, sourceEntries),
        [finesData, sourceEntries]
    )

    const pageTitle = labels.page_title.replace("{country}", localizedName)
    const pageSubtitle = labels.page_subtitle.replace("{country}", localizedName)
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
                breadcrumbCurrent={labels.breadcrumb_fines}
                title={pageTitle}
                subtitle={pageSubtitle}
                lastVerified={lastVerified}
                verifiedLabel={labels.verified_on}
                sourceCount={relatedSources.length}
                sourcesBadgeLabel={labels.sources_count}
            />

            <CountrySubnav
                lang={lang}
                countryIso2={countryIso2}
                active="fines"
                labels={navLabels}
                hasFaq
                hasFines
                accentColor={theme.accent}
            />

            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12">
                {/* Quick summary */}
                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white">{labels.summary_heading}</h2>
                    <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">{labels.summary_subheading}</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {finesData.summaries.map((summary) => (
                            <SummaryCard key={summary.id} summary={summary} labels={labels} lang={lang} />
                        ))}
                    </div>
                </section>

                {/* Categories */}
                <section className="mb-14">
                    <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white">{labels.categories_heading}</h2>
                    <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">{labels.categories_subheading}</p>
                    <AccordionPrimitive.Root
                        type="multiple"
                        value={openCategories}
                        onValueChange={setOpenCategories}
                        className="mt-6 space-y-3"
                    >
                        {categories.map((category) => (
                            <CategorySection
                                key={category.id}
                                category={category}
                                labels={{
                                    ...labels,
                                    ...Object.fromEntries(
                                        FINE_CATEGORY_ORDER.map((id) => [
                                            FINE_CATEGORY_LABEL_KEYS[id],
                                            labels[FINE_CATEGORY_LABEL_KEYS[id]] ?? id,
                                        ])
                                    ),
                                }}
                                lang={lang}
                            />
                        ))}
                    </AccordionPrimitive.Root>
                </section>

                {/* Disclaimer */}
                <div className="mb-12 flex gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 dark:border-slate-700 dark:bg-slate-800/40">
                    <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8] dark:text-slate-400" />
                    <p className="text-sm leading-relaxed text-[#64748B] dark:text-slate-400">{labels.disclaimer}</p>
                </div>

                {/* Sources */}
                <section className="border-t border-[#E2E8F0] pt-12 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-[#0F172A] dark:text-white md:text-2xl">{labels.sources_heading}</h2>
                    <p className="mt-2 text-sm text-[#64748B] dark:text-slate-400">{labels.sources_subheading}</p>
                    <div className="mt-6 grid gap-3">
                        {relatedSources.map((source) => (
                            <SourceCard
                                key={source.id}
                                source={source}
                                labels={sourceLabels}
                                lang={lang}
                                lastVerified={lastVerified}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
