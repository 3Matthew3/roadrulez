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
import AustriaTrafficLightsCompact from "@/components/country/austria-traffic-lights-compact"
import { SpeedLimitIllustration, type SpeedLimitScene } from "@/components/country/speed-limit-illustrations"
import { cn } from "@/lib/utils"
import { CountryData, TrafficRules } from "@/types/country"
import { formatSpeedWithConversion, type SpeedUnit } from "@/lib/speed-display"
import RegionalRulesAccordion from "@/components/country/regional-rules-accordion"
import { resolveFaqText } from "@/lib/faq-display"
import { getPublicSourceBadgeClass, getPublicSourceBadgeLabel } from "@/lib/source-display"

interface AustriaDashboardProps {
    data: CountryData
    localizedName: string
    dict: any
    lang: string
    vehicleType: string
    rules: TrafficRules
}

const RED = "#DC2626"

const S = {
    page: "min-h-screen bg-[#0B1120] text-slate-100",
    content: "mx-auto w-full max-w-6xl px-4 md:px-6",
    card: "rounded-2xl border border-slate-700 bg-[#1E293B]",
    muted: "text-slate-400",
    heading: "text-white",
    accent: "text-[#F87171]",
} as const

function alcoholLabel(rules: TrafficRules) {
    if (rules.alcohol_limit.unit === "BAC") {
        return `${rules.alcohol_limit.value.toFixed(2)}% BAC`
    }
    return `${rules.alcohol_limit.value} ${rules.alcohol_limit.unit}`
}

function formatVerifiedMonth(date: string | undefined, lang: string) {
    if (!date) return null
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return date
    const locale = lang === "de" ? "de-AT" : lang
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
}: {
    label: string
    value: number
    unit: SpeedUnit
    scene: SpeedLimitScene
}) {
    const formatted = formatSpeedWithConversion(value, unit)
    return (
        <article className="flex min-h-[180px] flex-col items-center rounded-xl border border-slate-700 bg-slate-800/40 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F87171]">{label}</p>
            <p className={cn("mt-2 text-4xl font-bold", S.heading)}>{formatted.primary}</p>
            <p className={cn("mt-1 text-sm", S.muted)}>{formatted.secondary}</p>
            <div className="mt-auto w-full pt-5">
                <div className="flex h-14 w-full items-end justify-center rounded-xl bg-slate-900/60 px-3 pb-1">
                    <SpeedLimitIllustration scene={scene} />
                </div>
            </div>
        </article>
    )
}

export default function AustriaDashboard({
    data,
    localizedName,
    dict,
    lang,
    vehicleType,
    rules,
}: AustriaDashboardProps) {
    const isGerman = lang === "de"
    const speedUnit = (rules.speed_limits.units === "mph" ? "mph" : "km/h") as SpeedUnit
    const verifiedLabel = formatVerifiedMonth(data.last_verified, lang)

    const labels = {
        guideTag: isGerman ? "Fahrleitfaden" : "Country guide",
        heroSubtitle: isGerman
            ? "Alles Wichtige zum Fahren in Österreich."
            : "Everything you need to know about driving in Austria.",
        quickAnswer: isGerman ? "Kurzantwort" : "Quick answer",
        topFines: isGerman ? "Top 3 Bußgelder" : "Top 3 fines",
        topFaq: isGerman ? "Top 3 FAQ" : "Top 3 FAQ",
        viewAllFines: isGerman ? "Alle Bußgelder" : "View all fines",
        viewAllFaq: isGerman ? "Alle FAQ" : "View all FAQ",
        verified: isGerman ? "Verifiziert" : "Verified",
        drivingSide: isGerman ? "Rechtsverkehr" : "Driving side",
        speedLimits: isGerman ? "Tempolimits" : "Speed limits",
        alcohol: isGerman ? "Alkohol" : "Alcohol limit",
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
        (isGerman
            ? [
                  "Vignette auf Autobahnen Pflicht",
                  "Strenge Geschwindigkeitskontrollen",
                  "Winterausrüstungsregeln beachten",
                  "Parkbußgelder häufig",
              ]
            : [
                  "Vignette required on motorways",
                  "Strict speed enforcement",
                  "Winter equipment rules apply",
                  "Parking fines are common",
              ])

    const speedSummary = [rules.speed_limits.urban, rules.speed_limits.rural, rules.speed_limits.motorway]
        .map((v) => formatSpeedWithConversion(v, speedUnit).primary)
        .join(" – ")

    const quickStats = [
        { label: labels.drivingSide, value: dict.common.right, icon: Car },
        { label: labels.speedLimits, value: speedSummary, icon: Gauge },
        { label: labels.alcohol, value: alcoholLabel(rules), icon: Wine },
        {
            label: labels.vignette,
            value: rules.tolls.required ? dict.common.yes : dict.common.no,
            icon: CreditCard,
        },
        { label: labels.emergency, value: rules.emergency_numbers[0] ?? "112", icon: PhoneCall },
    ]

    const topFines =
        data.top_fines ??
        (isGerman
            ? [
                  { title: "Tempo +10 km/h außerorts", amount: "ab €30" },
                  { title: "Handy am Steuer", amount: "€50" },
                  { title: "Keine Vignette auf Autobahn", amount: "ab €110" },
              ]
            : [
                  { title: "Speeding +10 km/h outside town limits", amount: "from €30" },
                  { title: "Using phone while driving", amount: "€50" },
                  { title: "No vignette on motorway", amount: "from €110" },
              ])

    const faqEntries =
        data.faq ??
        (isGerman
            ? [
                  {
                      question: "Brauche ich eine Vignette in Österreich?",
                      answer: "Ja. Autobahnen und Schnellstraßen erfordern eine gültige Vignette oder digitale Maut, bevor du sie benutzt.",
                  },
                  {
                      question: "Sind Winterreifen Pflicht?",
                      answer: "Vom 1. November bis 15. April sind Winterreifen bei winterlichen Straßenverhältnissen Pflicht. Schneeketten können ausgeschildert sein.",
                  },
                  {
                      question: "Kann ich meinen EU-Führerschein nutzen?",
                      answer: "EU- und EWR-Führerscheine werden in der Regel akzeptiert. Nicht-EU-Fahrer sollten Mietwagen-Anforderungen prüfen.",
                  },
              ]
            : [
                  {
                      question: "Do I need a vignette in Austria?",
                      answer: "Yes. Motorways and expressways require a valid vignette or digital toll before you drive on them.",
                  },
                  {
                      question: "Are winter tyres required?",
                      answer: "From 1 November to 15 April, winter tyres are required whenever winter road conditions apply.",
                  },
                  {
                      question: "Can I use my EU driving licence?",
                      answer: "EU and EEA licences are generally accepted. Non-EU drivers should confirm rental requirements.",
                  },
              ])

    const fineIcons = [Gauge, Smartphone, CreditCard]
    const sourceEntries = data.source_entries ?? []

    return (
        <div className={S.page}>
            <CountryViewTracker iso2={data.iso2} />

            {/* Hero */}
            <div className="relative h-[46vh] min-h-[360px] w-full overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[#111]">
                    <HeroImage name={data.name_en} images={data.header_images} />
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/60 to-black/25" />
                </div>

                <div className={cn(S.content, "relative z-20 flex h-full flex-col justify-end pb-10")}>
                    <span
                        className="mb-3 inline-flex w-fit rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                        style={{ backgroundColor: RED }}
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
                            variant="austria"
                        />
                    </Suspense>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/75">
                        <span>
                            {dict.common.last_verified}:{" "}
                            <span className="font-medium text-white">{verifiedLabel ?? data.last_verified}</span>
                        </span>
                        <span className="rounded-full border border-[#F87171]/40 bg-[#DC2626]/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#F87171]">
                            {labels.verified}
                        </span>
                    </div>
                </div>
            </div>

            <main className={cn(S.content, "space-y-8 pb-10 pt-2 md:pb-12")}>
                {/* Quick facts bar */}
                <section className="-mt-10 relative z-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl md:grid-cols-5">
                    {quickStats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.label}
                                className={cn(
                                    "bg-[#1E293B] p-4",
                                    index < quickStats.length - 1 && "md:border-r md:border-slate-700"
                                )}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-[#F87171]">
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
                                <li key={item} className="flex gap-2.5 text-sm text-slate-200">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-[#F87171]">
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
                            <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                {labels.viewAllFines}
                                <ChevronRight className="h-4 w-4" />
                            </span>
                        }
                    >
                        <ul className="space-y-4">
                            {topFines.slice(0, 3).map((fine, index) => {
                                const Icon = fineIcons[index] ?? Gavel
                                return (
                                    <li key={fine.title} className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <p className="text-sm leading-snug text-slate-200">{fine.title}</p>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-[#F87171]">
                                            {fine.amount}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    </PanelCard>

                    <AustriaTrafficLightsCompact lang={lang} />

                    <PanelCard
                        title={labels.topFaq}
                        action={
                            <Link
                                href={`/${lang}/country/${data.iso2.toLowerCase()}/faq`}
                                className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-300"
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
                                    className="border-slate-700"
                                >
                                    <AccordionTrigger className="text-left text-sm text-slate-200 hover:no-underline">
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
                <div className="flex gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <p className={cn("text-sm leading-relaxed", S.muted)}>{dict.common.disclaimer}</p>
                </div>

                {/* More details */}
                <section className="space-y-8 pt-2">
                    <h2 className={cn("text-xl font-semibold", S.heading)}>{labels.moreDetails}</h2>

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
                                />
                                <SpeedLimitCard
                                    label={labels.countryRoad}
                                    value={rules.speed_limits.rural}
                                    unit={speedUnit}
                                    scene="rural"
                                />
                                <SpeedLimitCard
                                    label={labels.motorway}
                                    value={rules.speed_limits.motorway}
                                    unit={speedUnit}
                                    scene="motorway"
                                />
                            </div>
                        </div>
                        {rules.speed_limits.notes && (
                            <div className="flex gap-3 border-t border-slate-700 bg-slate-800/50 px-5 py-4 md:px-6">
                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#F87171]" />
                                <p className={cn("text-sm leading-relaxed", S.muted)}>
                                    {rules.speed_limits.notes}
                                </p>
                            </div>
                        )}
                    </section>

                    {(data.regional_variations?.length ?? 0) > 0 && (
                        <RegionalRulesAccordion
                            variations={data.regional_variations ?? []}
                            lang={lang}
                        />
                    )}

                    {sourceEntries.length > 0 && (
                        <section>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className={cn("flex items-center gap-2 text-lg font-semibold", S.heading)}>
                                    <BookOpen className="h-5 w-5 text-[#F87171]" />
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
                            <AccordionItem value="phone" className="border-slate-700 bg-slate-800/40">
                                <AccordionTrigger className={S.heading}>
                                    {dict.rules.phone_distractions}
                                </AccordionTrigger>
                                <AccordionContent className={S.muted}>{rules.phone_usage_rules}</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="lights" className="border-slate-700 bg-slate-800/40">
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
