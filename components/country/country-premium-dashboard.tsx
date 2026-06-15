import Link from "next/link"
import { Suspense } from "react"
import {
    BookOpen,
    Car,
    Check,
    ChevronRight,
    CreditCard,
    ExternalLink,
    Gauge,
    Gavel,
    Info,
    PhoneCall,
    Smartphone,
    Wine,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CountryViewTracker } from "@/components/country-view-tracker"
import FeedbackForm from "@/components/country/feedback-form"
import HeroImage from "@/components/country/hero-image"
import VehicleSwitcher from "@/components/country/vehicle-switcher"
import CountrySubnav from "@/components/country/country-subnav"
import CountryTrafficLightsCompact from "@/components/country/country-traffic-lights-compact"
import { getCountryTheme } from "@/lib/country-theme"
import { SpeedLimitIllustration, type SpeedLimitScene } from "@/components/country/speed-limit-illustrations"
import { cn } from "@/lib/utils"
import { CountryData, TrafficRules } from "@/types/country"
import { formatSpeedWithConversion, type SpeedUnit } from "@/lib/speed-display"
import RegionalRulesAccordion from "@/components/country/regional-rules-accordion"
import AustriaSpeedLimitsSection from "@/components/country/austria-speed-limits-section"
import { resolveFaqText } from "@/lib/faq-display"
import { defaultFaq } from "@/lib/country-seeds/helpers"
import { getPublicSourceBadgeClass, getPublicSourceBadgeLabel } from "@/lib/source-display"
import { COUNTRY_PREMIUM as S } from "@/lib/country-premium-styles"

interface CountryPremiumDashboardProps {
    data: CountryData
    localizedName: string
    dict: any
    lang: string
    vehicleType: string
    rules: TrafficRules
}

const HERO_SUBTITLE: Record<string, { de: string; en: string }> = {
    AT: {
        de: "Alles Wichtige zum Fahren in Österreich.",
        en: "Everything you need to know about driving in Austria.",
    },
    DE: {
        de: "Alles Wichtige zum Fahren in Deutschland.",
        en: "Everything you need to know about driving in Germany.",
    },
    IT: {
        de: "Alles Wichtige zum Fahren in Italien.",
        en: "Everything you need to know about driving in Italy.",
    },
    US: {
        de: "Alles Wichtige zum Fahren in den USA.",
        en: "Everything you need to know about driving in the United States.",
    },
    GB: {
        de: "Alles Wichtige zum Fahren im Vereinigten Königreich.",
        en: "Everything you need to know about driving in the United Kingdom.",
    },
}

function alcoholLabel(rules: TrafficRules) {
    if (rules.alcohol_limit.unit === "BAC") {
        return `${rules.alcohol_limit.value.toFixed(2)}% BAC`
    }
    return `${rules.alcohol_limit.value} ${rules.alcohol_limit.unit}`
}

function formatVerifiedMonth(date: string | undefined, lang: string, localeOverride?: string) {
    if (!date) return null
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return date
    const locale = localeOverride ?? (lang === "de" ? "de-DE" : lang)
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(parsed)
}

function PanelCard({
    title,
    action,
    children,
    className,
}: {
    title: string
    action?: React.ReactNode
    children: React.ReactNode
    className?: string
}) {
    return (
        <article className={cn(S.card, "p-5 md:p-6", className)}>
            <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className={cn("text-lg font-semibold", S.heading)}>{title}</h2>
                {action}
            </div>
            {children}
        </article>
    )
}

function SpeedLimitCard({
    label,
    value,
    unit,
    scene,
    accentColor,
}: {
    label: string
    value: number
    unit: SpeedUnit
    scene: SpeedLimitScene
    accentColor: string
}) {
    const formatted = formatSpeedWithConversion(value, unit)
    return (
        <article className="flex min-h-[180px] flex-col items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 text-center dark:border-slate-600 dark:bg-slate-800">
            <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: accentColor }}
            >
                {label}
            </p>
            <p className={cn("mt-2 text-4xl font-bold", S.heading)}>{formatted.primary}</p>
            <p className={cn("mt-1 text-sm", S.muted)}>{formatted.secondary}</p>
            <div className="mt-auto w-full pt-5">
                <div className="flex h-14 w-full items-end justify-center rounded-xl bg-[#EEF2FF] px-3 pb-1 dark:bg-slate-900/80">
                    <SpeedLimitIllustration scene={scene} />
                </div>
            </div>
        </article>
    )
}

export default function CountryPremiumDashboard({
    data,
    localizedName,
    dict,
    lang,
    vehicleType,
    rules,
}: CountryPremiumDashboardProps) {
    const theme = getCountryTheme(data.iso2)
    const isGerman = lang === "de"
    const speedUnit = (rules.speed_limits.units === "mph" ? "mph" : "km/h") as SpeedUnit
    const verifiedLabel = formatVerifiedMonth(data.last_verified, lang, theme.verifiedLocale)
    const heroSubtitle =
        HERO_SUBTITLE[data.iso2.toUpperCase()]?.[isGerman ? "de" : "en"] ??
        (isGerman
            ? `Alles Wichtige zum Fahren in ${localizedName}.`
            : `Everything you need to know about driving in ${localizedName}.`)

    const labels = {
        guideTag: isGerman ? "Fahrleitfaden" : "Country guide",
        heroSubtitle,
        quickAnswer: isGerman ? "Kurzantwort" : "Quick answer",
        topFines: isGerman ? "Top 3 Bußgelder" : "Top 3 fines",
        topFaq: isGerman ? "Top 3 FAQ" : "Top 3 FAQ",
        viewAllFines: isGerman ? "Alle Bußgelder" : "View all fines",
        viewAllFaq: isGerman ? "Alle FAQ" : "View all FAQ",
        verified: isGerman ? "Verifiziert" : "Verified",
        drivingSide: isGerman ? "Rechtsverkehr" : "Driving side",
        speedLimits: isGerman ? "Tempolimits" : "Speed limits",
        alcohol: isGerman ? "Alkohol" : "Alcohol limit",
        tollsLabel: isGerman ? "Autobahn-Maut" : "Motorway tolls",
        tollLabel: isGerman ? "Maut" : "Tolls",
        vignette: isGerman ? "Vignette" : "Vignette",
        emergency: isGerman ? "Notruf" : "Emergency number",
        city: isGerman ? "Stadt" : "Urban",
        countryRoad: isGerman ? "Landstraße" : "Rural",
        motorway: isGerman ? "Autobahn" : "Motorway",
        details: isGerman ? "Details bei Bedarf" : "Details when needed",
        viewAllSources: dict.sources_page?.view_all ?? "All sources",
        sourcesTitle: isGerman ? "Quellen" : "Sources",
        moreDetails: isGerman ? "Weitere Details" : "More details",
    }

    const quickBullets =
        data.quick_answer_bullets ??
        (data.common_traps?.slice(0, 4) ??
            (isGerman
                ? [
                      "Offizielle Schilder haben Vorrang",
                      "Tempokontrollen sind häufig",
                      "Handy am Steuer ist verboten",
                      "Prüfe Maut/Vignette vor Autobahnfahrt",
                  ]
                : [
                      "Posted signs override defaults",
                      "Speed enforcement is common",
                      "Handheld phone use is banned",
                      "Check toll/vignette before motorways",
                  ]))

    const speedSummary = [rules.speed_limits.urban, rules.speed_limits.rural, rules.speed_limits.motorway]
        .map((v) => formatSpeedWithConversion(v, speedUnit).primary)
        .join(" – ")

    const quickStats = [
        { label: labels.drivingSide, value: dict.common.right, icon: Car },
        { label: labels.speedLimits, value: speedSummary, icon: Gauge },
        { label: labels.alcohol, value: alcoholLabel(rules), icon: Wine },
        {
            label:
                data.iso2 === "AT"
                    ? labels.vignette
                    : data.iso2 === "IT"
                      ? labels.tollLabel
                      : labels.tollsLabel,
            value: rules.tolls.required ? dict.common.yes : dict.common.no,
            icon: CreditCard,
        },
        { label: labels.emergency, value: rules.emergency_numbers[0] ?? "112", icon: PhoneCall },
    ]

    const topFines =
        data.top_fines ??
        (isGerman
            ? [
                  { title: "Geschwindigkeitsüberschreitung", amount: "ab €50" },
                  { title: "Handy am Steuer", amount: "€100+" },
                  { title: "Parkverstoß", amount: "ab €25" },
              ]
            : [
                  { title: "Speeding", amount: "from €50" },
                  { title: "Using phone while driving", amount: "€100+" },
                  { title: "Parking violation", amount: "from €25" },
              ])

    const faqEntries = data.faq ?? defaultFaq(localizedName, localizedName)

    const fineIcons = [Gauge, Smartphone, CreditCard]
    const sourceEntries = data.source_entries ?? []

    return (
        <div className={S.page}>
            <CountryViewTracker iso2={data.iso2} />

            {/* Hero */}
            <div className="relative h-[46vh] min-h-[360px] w-full overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[#111]">
                    <HeroImage name={data.name_en} images={data.header_images} />
                    <div className={S.heroGradLight} />
                    <div className={S.heroGradDark} />
                </div>

                <div className={cn(S.content, "relative z-20 flex h-full flex-col justify-end pb-10")}>
                    <span
                        className={cn(
                            "mb-3 inline-flex w-fit rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em]",
                            !theme.accentBlack && "text-white"
                        )}
                        style={{
                            backgroundColor: theme.accentBlack ?? theme.accentDark,
                            color: theme.accentBlack ? theme.accent : undefined,
                        }}
                    >
                        {labels.guideTag}
                    </span>

                    <div className="mb-4 flex items-center gap-4">
                        <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-white/20 shadow-md md:h-16 md:w-24">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://flagcdn.com/w320/${data.iso2.toLowerCase()}.png`}
                                alt={`${localizedName} flag`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                                {localizedName}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
                                {labels.heroSubtitle}
                            </p>
                        </div>
                    </div>

                    <Suspense
                        fallback={
                            <div className="h-11 w-64 animate-pulse rounded-xl bg-white/10" />
                        }
                    >
                        <VehicleSwitcher
                            currentVehicle={vehicleType}
                            labels={dict.vehicle}
                            variant="premium"
                            fill={theme.fill}
                            fillText={theme.fillText}
                        />
                    </Suspense>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/75">
                        <span>
                            {dict.common.last_verified}:{" "}
                            <span className="font-medium text-white">{verifiedLabel ?? data.last_verified}</span>
                        </span>
                        <span
                            className="rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
                            style={{
                                borderColor: `${theme.accent}80`,
                                backgroundColor: theme.accentMuted,
                                color: theme.accent,
                            }}
                        >
                            {labels.verified}
                        </span>
                    </div>
                </div>
            </div>

            <CountrySubnav
                lang={lang}
                countryIso2={data.iso2}
                active="overview"
                labels={(dict.country_nav ?? {}) as Record<string, string>}
                hasFaq={Boolean(data.faq?.length)}
                hasFines={Boolean(data.traffic_fines)}
            />

            <main className={cn(S.content, "space-y-8 pb-10 pt-6 md:pb-12 md:pt-8")}>
                {/* Quick facts bar */}
                <section className={cn("relative z-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-5", S.statsBar)}>
                    {quickStats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.label}
                                className={cn(
                                    S.statsCell,
                                    "p-4",
                                    index < quickStats.length - 1 && S.statsCellBorder
                                )}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <div
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                                        style={{ backgroundColor: theme.accentMuted, color: theme.accent }}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <p className={cn("text-xs font-medium", S.muted)}>{stat.label}</p>
                                </div>
                                <p className={cn("text-sm font-bold leading-snug md:text-[15px]", S.heading)}>
                                    {stat.value}
                                </p>
                            </div>
                        )
                    })}
                </section>

                {/* Main 2×2 grid */}
                <div className="grid gap-5 lg:grid-cols-2">
                    <PanelCard title={labels.quickAnswer}>
                        <p className={cn("text-sm leading-relaxed", S.muted)}>
                            {data.summary}
                        </p>
                        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                            {quickBullets.map((item) => (
                                <li key={item} className={cn("flex gap-2.5 text-sm", S.body)}>
                                    <span
                                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                        style={{ backgroundColor: theme.accentMuted, color: theme.accent }}
                                    >
                                        <Check className="h-3 w-3" />
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </PanelCard>

                    <PanelCard
                        title={labels.topFines}
                        action={
                            <Link
                                href={`/${lang}/country/${data.iso2.toLowerCase()}/fines`}
                                className={cn("inline-flex items-center gap-1 text-sm", S.link)}
                            >
                                {labels.viewAllFines}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        }
                    >
                        <ul className="space-y-4">
                            {topFines.slice(0, 3).map((fine, index) => {
                                const Icon = fineIcons[index] ?? Gavel
                                return (
                                    <li key={fine.title} className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#475569] dark:bg-slate-800 dark:text-slate-300">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <p className={cn("text-sm leading-snug", S.body)}>{fine.title}</p>
                                        </div>
                                        <span
                                            className="shrink-0 text-sm font-semibold"
                                            style={{ color: theme.accent }}
                                        >
                                            {fine.amount}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    </PanelCard>

                    <CountryTrafficLightsCompact
                        lang={lang}
                        countryIso2={data.iso2}
                        variant={theme.trafficLightVariant}
                        accentColor={theme.accent}
                        accentDark={theme.accentDark}
                        fill={theme.fill}
                        fillText={theme.fillText}
                    />

                    <PanelCard
                        title={labels.topFaq}
                        action={
                            <Link
                                href={`/${lang}/country/${data.iso2.toLowerCase()}/faq`}
                                className={cn("inline-flex items-center gap-1 text-sm", S.link)}
                            >
                                {labels.viewAllFaq}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        }
                    >
                        <Accordion type="single" collapsible className="w-full">
                            {faqEntries.slice(0, 3).map((entry, index) => {
                                const { question, answer } = resolveFaqText(entry, lang)
                                return (
                                <AccordionItem
                                    key={entry.id ?? entry.question}
                                    value={`faq-${index}`}
                                    className={cn(S.accordionBorder, "border-b last:border-b-0")}
                                >
                                    <AccordionTrigger className={cn("text-left text-sm hover:no-underline", S.body)}>
                                        {question}
                                    </AccordionTrigger>
                                    <AccordionContent className={cn("text-sm leading-relaxed", S.muted)}>
                                        {answer}
                                    </AccordionContent>
                                </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </PanelCard>
                </div>

                {/* Disclaimer */}
                <div className="flex gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 dark:border-slate-700 dark:bg-[#1E293B]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <p className={cn("text-sm leading-relaxed", S.muted)}>{dict.common.disclaimer}</p>
                </div>

                {/* More details */}
                <section className="space-y-8 pt-2">
                    <h2 className={cn("text-xl font-semibold", S.heading)}>{labels.moreDetails}</h2>

                    {data.iso2.toUpperCase() === "AT" ? (
                        <AustriaSpeedLimitsSection
                            title={dict.rules.speed_limits}
                            urban={rules.speed_limits.urban}
                            rural={rules.speed_limits.rural}
                            motorway={rules.speed_limits.motorway}
                            unit={speedUnit}
                            notes={rules.speed_limits.notes}
                            lang={lang}
                            labels={{
                                city: labels.city,
                                countryRoad: labels.countryRoad,
                                motorway: labels.motorway,
                            }}
                        />
                    ) : (
                        <section className={cn("overflow-hidden", S.card)}>
                            <div className="p-5 md:p-6">
                                <h3 className={cn("mb-4 text-lg font-semibold", S.heading)}>
                                    {dict.rules.speed_limits}
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <SpeedLimitCard
                                        label={labels.city}
                                        value={rules.speed_limits.urban}
                                        unit={speedUnit}
                                        scene="urban"
                                        accentColor={theme.accent}
                                    />
                                    <SpeedLimitCard
                                        label={labels.countryRoad}
                                        value={rules.speed_limits.rural}
                                        unit={speedUnit}
                                        scene="rural"
                                        accentColor={theme.accent}
                                    />
                                    <SpeedLimitCard
                                        label={labels.motorway}
                                        value={rules.speed_limits.motorway}
                                        unit={speedUnit}
                                        scene="motorway"
                                        accentColor={theme.accent}
                                    />
                                </div>
                            </div>
                            {rules.speed_limits.notes && (
                                <div className="flex gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 dark:border-slate-700 dark:bg-[#1E293B] md:px-6">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.accent }} />
                                    <p className={cn("text-sm leading-relaxed", S.muted)}>
                                        {rules.speed_limits.notes}
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    {(data.regional_variations?.length ?? 0) > 0 && (
                        <RegionalRulesAccordion
                            variations={data.regional_variations ?? []}
                            lang={lang}
                            countryIso2={data.iso2}
                        />
                    )}

                    {sourceEntries.length > 0 && (
                        <section>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className={cn("flex items-center gap-2 text-lg font-semibold", S.heading)}>
                                    <BookOpen className="h-5 w-5" style={{ color: theme.accent }} />
                                    {labels.sourcesTitle}
                                </h3>
                                <Link
                                    href={`/${lang}/country/${data.iso2.toLowerCase()}/sources`}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#3B82F6] hover:underline"
                                >
                                    {labels.viewAllSources}
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {sourceEntries.slice(0, 4).map((source) => (
                                    <article key={source.id} className={cn("flex flex-col p-4", S.card)}>
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn("font-medium leading-snug hover:underline", S.heading)}
                                        >
                                            {source.title}
                                        </a>
                                        {source.publisher && (
                                            <p className={cn("mt-1 text-xs", S.muted)}>{source.publisher}</p>
                                        )}
                                        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                                            <span
                                                className={cn(
                                                    "rounded-full border px-2 py-0.5 text-[10px]",
                                                    getPublicSourceBadgeClass(source)
                                                )}
                                            >
                                                {getPublicSourceBadgeLabel(
                                                    source,
                                                    (dict.sources_page ?? {}) as Record<string, string>
                                                )}
                                            </span>
                                            <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" />
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className={cn("p-6", S.card)}>
                        <h3 className={cn("mb-4 text-lg font-semibold", S.heading)}>{labels.details}</h3>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem
                                value="phone"
                                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] dark:border-slate-600 dark:bg-slate-800"
                            >
                                <AccordionTrigger className={S.heading}>
                                    {dict.rules.phone_distractions}
                                </AccordionTrigger>
                                <AccordionContent className={S.muted}>{rules.phone_usage_rules}</AccordionContent>
                            </AccordionItem>
                            <AccordionItem
                                value="lights"
                                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] dark:border-slate-600 dark:bg-slate-800"
                            >
                                <AccordionTrigger className={S.heading}>
                                    {dict.rules.lights_parking}
                                </AccordionTrigger>
                                <AccordionContent className={cn("space-y-2", S.muted)}>
                                    <p>
                                        <strong className={S.heading}>{dict.props.headlights}:</strong>{" "}
                                        {rules.headlights_rules}
                                    </p>
                                    <p>
                                        <strong className={S.heading}>{dict.props.parking}:</strong>{" "}
                                        {rules.parking_rules}
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    <FeedbackForm labels={dict.extra} countryName={data.name_en} />
                </section>
            </main>
        </div>
    )
}
