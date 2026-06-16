"use client"

import Link from "next/link"
import { useCallback, useRef, useState } from "react"
import { ChevronRight, Globe, Map, ShieldCheck } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { CountrySearch } from "@/components/country-search"
import { COUNTRY_PREMIUM as S } from "@/lib/country-premium-styles"
import type { CountriesPageData } from "@/lib/countries-page-shared"
import { getRegionLabel } from "@/lib/countries-page-shared"
import { cn } from "@/lib/utils"

interface CountriesPageViewProps {
    lang: string
    data: CountriesPageData
    labels: Record<string, string>
    initialSearchQuery?: string
}

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1800&q=80"

/** Sticky site header (~64px) plus a little breathing room */
const REGION_SCROLL_MARGIN_CLASS = "scroll-mt-20"

function FlagBadge({ iso2, name, muted }: { iso2: string; name: string; muted?: boolean }) {
    return (
        <span className="inline-flex h-5 w-7 shrink-0 overflow-hidden rounded-sm border border-[#E2E8F0] shadow-sm dark:border-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={`https://flagcdn.com/w80/${iso2.toLowerCase()}.png`}
                alt={`${name} flag`}
                className={cn("h-full w-full object-cover", muted && "opacity-60 grayscale")}
            />
        </span>
    )
}

function PopularCountryCard({
    lang,
    country,
    labels,
}: {
    lang: string
    country: CountriesPageData["popular"][0]
    labels: Record<string, string>
}) {
    const [imageSrc, setImageSrc] = useState(country.image || FALLBACK_IMAGE)

    return (
        <Link
            href={`/${lang}/country/${country.iso2.toLowerCase()}`}
            className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition hover:border-[#CBD5E1] hover:shadow-md dark:border-slate-700 dark:bg-[#1E293B] dark:hover:border-slate-500"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageSrc}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={() => {
                        if (imageSrc !== FALLBACK_IMAGE) setImageSrc(FALLBACK_IMAGE)
                    }}
                />
            </div>
            <div className="p-4">
                <div className="flex items-center gap-2.5">
                    <FlagBadge iso2={country.iso2} name={country.name} />
                    <h3 className={cn("font-semibold", S.heading)}>{country.name}</h3>
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-2">
                        <dt className={S.muted}>{labels.drive_on}</dt>
                        <dd className={cn("font-medium capitalize", S.body)}>
                            {country.driveSide === "left" ? labels.left : labels.right}
                        </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                        <dt className={S.muted}>{labels.top_speed}</dt>
                        <dd className={cn("font-medium", S.body)}>{country.topSpeed}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                        <dt className={S.muted}>{labels.alcohol_limit}</dt>
                        <dd className={cn("font-medium", S.body)}>{country.alcoholLimit}</dd>
                    </div>
                </dl>
            </div>
        </Link>
    )
}

function RegionCountryCard({
    lang,
    country,
    labels,
}: {
    lang: string
    country: CountriesPageData["regions"][0]["available"][0]
    labels: Record<string, string>
}) {
    const inner = (
        <>
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <FlagBadge iso2={country.iso2} name={country.name} muted={!country.available} />
                    <span className={cn("truncate font-medium", S.heading)}>{country.name}</span>
                </div>
                <span
                    className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        country.available
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}
                >
                    {country.available ? labels.available : labels.coming_soon}
                </span>
            </div>
            {country.available ? (
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] dark:text-[#3B82F6]">
                    {labels.view_guide}
                    <ChevronRight className="h-4 w-4" />
                </span>
            ) : (
                <p className={cn("mt-3 text-sm", S.muted)}>{labels.guide_in_progress}</p>
            )}
        </>
    )

    const className = cn(
        "rounded-xl border p-4 transition",
        country.available
            ? "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-sm dark:border-slate-700 dark:bg-[#1E293B] dark:hover:border-slate-500"
            : "border-dashed border-[#E2E8F0] bg-[#FAFBFC] dark:border-slate-700 dark:bg-slate-800/50"
    )

    return (
        <Link href={`/${lang}/country/${country.iso2.toLowerCase()}`} className={className}>
            {inner}
        </Link>
    )
}

export default function CountriesPageView({
    lang,
    data,
    labels,
    initialSearchQuery = "",
}: CountriesPageViewProps) {
    const [openRegion, setOpenRegion] = useState<string | undefined>(undefined)
    const regionRefs = useRef<Record<string, HTMLDivElement | null>>({})

    const scrollToRegion = useCallback((regionId: string) => {
        const scroll = () => {
            regionRefs.current[regionId]?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        // Let the previously open panel collapse before scrolling to the new header.
        window.requestAnimationFrame(() => {
            window.setTimeout(scroll, 200)
        })
    }, [])

    const handleRegionChange = (value: string) => {
        const next = value || undefined
        const previous = openRegion
        setOpenRegion(next)
        if (next && next !== previous) {
            scrollToRegion(next)
        }
    }

    return (
        <div className={S.page}>
            <section className="overflow-hidden border-b border-[#E2E8F0] bg-[#F4F7FB] dark:border-slate-800 dark:bg-[#0B1120]">
                <div className="mx-auto grid max-w-6xl lg:grid-cols-2 lg:min-h-[420px]">
                    <div className="relative z-10 flex flex-col justify-center px-4 py-12 md:px-6 md:py-16 lg:py-20">
                        <h1 className="max-w-xl text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl dark:text-white">
                            {labels.page_title}
                        </h1>
                        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#475569] sm:text-lg dark:text-slate-400">
                            {labels.page_subtitle}
                        </p>
                        <div className="mt-8 max-w-lg rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-[#1E293B]">
                            <CountrySearch
                                initialQuery={initialSearchQuery}
                                placeholder={labels.search_placeholder}
                                inputClassName="h-12 rounded-lg border-0 bg-white text-[#0F172A] placeholder:text-[#94A3B8] dark:bg-[#1E293B] dark:text-white dark:placeholder:text-slate-500"
                                resultsClassName="mt-2 rounded-lg border border-[#E2E8F0] bg-white dark:border-slate-700 dark:bg-[#1E293B]"
                            />
                        </div>
                    </div>

                    <div className="relative min-h-[220px] lg:min-h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={HERO_IMAGE}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F7FB] via-[#F4F7FB]/75 to-transparent dark:from-[#0B1120] dark:via-[#0B1120]/80 dark:to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#F4F7FB] via-transparent to-transparent dark:from-[#0B1120] lg:hidden" />
                    </div>
                </div>
            </section>

            <section className={cn(S.content, "py-12 md:py-14")}>
                <h2 className={cn("text-xl font-semibold sm:text-2xl", S.heading)}>{labels.popular_title}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.popular.map((country) => (
                        <PopularCountryCard key={country.iso2} lang={lang} country={country} labels={labels} />
                    ))}
                </div>
            </section>

            <section className={cn(S.content, "pb-12 md:pb-14")}>
                <h2 className={cn("text-xl font-semibold sm:text-2xl", S.heading)}>{labels.browse_title}</h2>
                <Accordion
                    type="single"
                    collapsible
                    value={openRegion}
                    onValueChange={handleRegionChange}
                    className="mt-6 space-y-3"
                >
                    {data.regions.map((region) => {
                        const regionLabel = getRegionLabel(region.id, lang)
                        const total = region.available.length + region.comingSoon.length
                        return (
                            <AccordionItem
                                key={region.id}
                                ref={(node) => {
                                    regionRefs.current[region.id] = node
                                }}
                                value={region.id}
                                className={cn(
                                    "overflow-hidden rounded-2xl border px-1",
                                    REGION_SCROLL_MARGIN_CLASS,
                                    S.accordionItem
                                )}
                            >
                                <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
                                    <div className="flex items-center gap-3 text-left">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-[#2563EB] dark:bg-slate-800 dark:text-[#3B82F6]">
                                            <Globe className="h-4 w-4" />
                                        </span>
                                        <span className={cn("text-base font-semibold", S.heading)}>
                                            {regionLabel}
                                            <span className={cn("ml-2 font-normal", S.muted)}>({total})</span>
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-5 sm:px-5">
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {[...region.available, ...region.comingSoon]
                                            .sort((a, b) => a.name.localeCompare(b.name, lang))
                                            .map((country) => (
                                            <RegionCountryCard
                                                key={country.iso2}
                                                lang={lang}
                                                country={country}
                                                labels={labels}
                                            />
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </section>

            <section className="border-t border-[#E2E8F0] bg-[#EEF2F6] dark:border-slate-800 dark:bg-slate-900/50">
                <div className={cn(S.content, "py-10 md:py-12")}>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className={cn("rounded-2xl border p-6", S.card)}>
                            <Globe className="h-6 w-6 text-[#2563EB] dark:text-[#3B82F6]" />
                            <p className={cn("mt-4 text-2xl font-bold", S.heading)}>
                                {labels.stats_available.replace("{count}", String(data.stats.availableCount))}
                            </p>
                            <p className={cn("mt-1 text-sm", S.muted)}>{labels.stats_available_sub}</p>
                        </div>
                        <div className={cn("rounded-2xl border p-6", S.card)}>
                            <Map className="h-6 w-6 text-[#2563EB] dark:text-[#3B82F6]" />
                            <p className={cn("mt-4 text-2xl font-bold", S.heading)}>
                                {labels.stats_planned.replace("{count}", String(data.stats.plannedCount))}
                            </p>
                            <p className={cn("mt-1 text-sm", S.muted)}>{labels.stats_planned_sub}</p>
                        </div>
                        <div className={cn("rounded-2xl border p-6", S.card)}>
                            <ShieldCheck className="h-6 w-6 text-[#2563EB] dark:text-[#3B82F6]" />
                            <p className={cn("mt-4 text-2xl font-bold", S.heading)}>{labels.stats_verified}</p>
                            <p className={cn("mt-1 text-sm", S.muted)}>{labels.stats_verified_sub}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
