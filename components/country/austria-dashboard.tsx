import Link from "next/link"
import { Suspense } from "react"
import {
    AlertTriangle,
    BookOpen,
    Building2,
    Car,
    ChevronRight,
    CreditCard,
    ExternalLink,
    Contact,
    Gauge,
    Info,
    PhoneCall,
    ShieldCheck,
    Snowflake,
    Trees,
    Wine,
    Wrench,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CountryViewTracker } from "@/components/country-view-tracker"
import FeedbackForm from "@/components/country/feedback-form"
import HeroImage from "@/components/country/hero-image"
import VehicleSwitcher from "@/components/country/vehicle-switcher"
import AustriaTrafficLights from "@/components/country/austria-traffic-lights"
import { cn } from "@/lib/utils"
import { CountryData, TrafficRules } from "@/types/country"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"
import { formatSpeedWithConversion, type SpeedUnit } from "@/lib/speed-display"
import { getSourceTypeBadgeClass } from "@/lib/source-display"

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
    page: "min-h-screen bg-[#F5F7FA] text-[#0F172A] dark:bg-[#0F172A] dark:text-[#F8FAFC]",
    card: "rounded-2xl border border-[#E2E8F0] bg-white shadow-sm dark:border-slate-700 dark:bg-[#1E293B]",
    muted: "text-[#64748B] dark:text-slate-400",
    heading: "text-[#0F172A] dark:text-[#F8FAFC]",
    accent: "text-[#DC2626] dark:text-[#F87171]",
    heroGradLight:
        "absolute inset-0 z-10 bg-gradient-to-t from-[#F5F7FA] via-[#F5F7FA]/88 to-red-900/25 dark:hidden",
    heroGradDark:
        "absolute inset-0 z-10 hidden bg-gradient-to-t from-[#0F172A] via-[#0F172A]/75 to-red-950/50 dark:block",
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

function SpeedLimitCard({
    label,
    value,
    unit,
    icon: Icon,
}: {
    label: string
    value: number
    unit: SpeedUnit
    icon: React.ComponentType<{ className?: string }>
}) {
    const formatted = formatSpeedWithConversion(value, unit)
    return (
        <article className={cn("flex flex-col items-center p-5 text-center", S.card)}>
            <div className="mb-4 flex h-16 w-full items-end justify-center rounded-xl bg-[#F5F7FA] px-4 dark:bg-slate-800/60">
                <Icon className="h-10 w-10 text-[#DC2626] dark:text-[#F87171]" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#DC2626] dark:text-[#F87171]">
                {label}
            </p>
            <p className={cn("mt-2 text-4xl font-bold", S.heading)}>{formatted.primary}</p>
            <p className={cn("mt-1 text-sm", S.muted)}>{formatted.secondary}</p>
        </article>
    )
}

function PreTripCard({
    title,
    text,
    icon: Icon,
    tone,
}: {
    title: string
    text: string
    icon: React.ComponentType<{ className?: string }>
    tone: "blue" | "red" | "green" | "orange"
}) {
    const iconTone = {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
        red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
        green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    }

    return (
        <article className={cn("p-4", S.card)}>
            <div className="mb-3 flex items-center gap-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconTone[tone])}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className={cn("font-semibold", S.heading)}>{title}</h3>
            </div>
            <p className={cn("text-sm leading-relaxed", S.muted)}>{text}</p>
        </article>
    )
}

function InfoRowCard({
    title,
    text,
    icon: Icon,
}: {
    title: string
    text: string
    icon: React.ComponentType<{ className?: string }>
}) {
    return (
        <article
            className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors",
                S.card,
                "hover:border-red-200 dark:hover:border-red-500/30"
            )}
        >
            <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#DC2626] dark:bg-red-500/10 dark:text-[#F87171]">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <h3 className={cn("font-semibold", S.heading)}>{title}</h3>
                    <p className={cn("mt-1 text-sm leading-relaxed", S.muted)}>{text}</p>
                </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
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
        guideTag: isGerman ? "Fahrleitfaden" : "Driving guide",
        quickAnswer: isGerman ? "Kurzantwort" : "Quick answer",
        quickIntro: isGerman
            ? "Österreich ist unkompliziert zum Fahren, aber beachte:"
            : "Austria is easy to drive in, but remember:",
        beforeDrive: isGerman ? "Vor der Fahrt prüfen" : "Before you drive",
        keyRisks: isGerman ? "Worauf du achten solltest" : "What to watch",
        details: isGerman ? "Details bei Bedarf" : "Details when needed",
        tollNeeded: isGerman ? "Vignette nötig" : "Vignette needed",
        license: isGerman ? "Führerschein" : "Driving licence",
        tollVignette: isGerman ? "Maut & Vignette" : "Tolls & vignette",
        winterGear: isGerman ? "Winterausrüstung" : "Winter equipment",
        mandatoryGear: isGerman ? "Pflichtausstattung" : "Mandatory equipment",
        verified: isGerman ? "Verifiziert" : "Verified",
        driveSide: isGerman ? "Rechtsverkehr" : "Drives right",
        speed: isGerman ? "Tempo" : "Speed",
        alcohol: isGerman ? "Alkohol" : "Alcohol",
        tolls: isGerman ? "Maut" : "Tolls",
        emergency: isGerman ? "Notruf" : "Emergency",
        city: isGerman ? "Stadt" : "Urban",
        countryRoad: isGerman ? "Landstraße" : "Rural",
        motorway: isGerman ? "Autobahn" : "Motorway",
        viewAllSources: dict.sources_page?.view_all ?? "All sources",
        sourcesTitle: isGerman ? "Quellen" : "Sources",
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
        .join(" · ")

    const quickStats = [
        { label: labels.driveSide, value: dict.common.right, icon: Car },
        { label: labels.speed, value: speedSummary, icon: Gauge },
        { label: labels.alcohol, value: alcoholLabel(rules), icon: Wine },
        {
            label: labels.tolls,
            value: rules.tolls.required
                ? `${dict.common.yes}${rules.tolls.type ? ` (${rules.tolls.type})` : ""}`
                : dict.common.no,
            icon: CreditCard,
        },
        { label: labels.emergency, value: rules.emergency_numbers[0] ?? "112", icon: PhoneCall },
    ]

    const preTripCards = [
        {
            title: labels.license,
            text: data.rental_and_idp_notes ?? "",
            icon: Contact,
            tone: "blue" as const,
        },
        {
            title: labels.tollVignette,
            text: rules.tolls.notes ?? "",
            icon: CreditCard,
            tone: "red" as const,
        },
        {
            title: labels.winterGear,
            text: rules.winter_rules ?? "",
            icon: Snowflake,
            tone: "green" as const,
        },
        {
            title: labels.mandatoryGear,
            text: rules.mandatory_equipment.join(" · "),
            icon: Wrench,
            tone: "orange" as const,
        },
    ]

    const sourceEntries = data.source_entries ?? []
    const driveSideLabel = dict.common.right

    return (
        <div className={S.page}>
            <CountryViewTracker iso2={data.iso2} />

            {/* Hero */}
            <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[#111]">
                    <HeroImage name={data.name_en} images={data.header_images} />
                    <div className={S.heroGradLight} />
                    <div className={S.heroGradDark} />
                </div>

                <div className="container relative z-20 flex h-full flex-col justify-end px-4 pb-8 md:px-6">
                    <span
                        className="mb-3 inline-flex w-fit rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                        style={{ backgroundColor: RED }}
                    >
                        {labels.guideTag}
                    </span>

                    <div className="mb-5 flex items-center gap-4">
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
                            <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                                <Info className="h-4 w-4" />
                                <span>
                                    {dict.props.drive_side}:{" "}
                                    <span className="font-semibold text-white">{driveSideLabel}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <Suspense
                        fallback={
                            <div className="h-11 w-64 animate-pulse rounded-xl bg-white/20 dark:bg-slate-800/60" />
                        }
                    >
                        <VehicleSwitcher
                            currentVehicle={vehicleType}
                            labels={dict.vehicle}
                            variant="austria"
                        />
                    </Suspense>
                </div>
            </div>

            {/* Verification bar */}
            <div className="border-b border-[#E2E8F0] bg-white dark:border-slate-800 dark:bg-[#1E293B]">
                <div className="container flex flex-wrap items-center gap-3 px-4 py-3 text-sm md:px-6">
                    <span className={S.muted}>
                        {dict.common.last_verified}:{" "}
                        <span className={cn("font-medium", S.heading)}>{verifiedLabel ?? data.last_verified}</span>
                    </span>
                    <span className="rounded-full border border-[#DC2626]/40 bg-[#DC2626]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#DC2626] dark:text-[#F87171]">
                        {labels.verified}
                    </span>
                </div>
            </div>

            <main className="container space-y-8 px-4 py-8 md:px-6 md:py-10">
                {/* Quick stats row */}
                <section className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-5", S.card)}>
                    {quickStats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.label}
                                className={cn(
                                    "bg-white p-4 dark:bg-[#1E293B]",
                                    index < quickStats.length - 1 && "md:border-r md:border-[#E2E8F0] dark:md:border-slate-700"
                                )}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-[#DC2626] dark:text-[#F87171]" />
                                    <p className={cn("text-xs font-medium", S.muted)}>{stat.label}</p>
                                </div>
                                <p className={cn("text-sm font-bold leading-snug md:text-base", S.heading)}>
                                    {stat.value}
                                </p>
                            </div>
                        )
                    })}
                </section>

                {/* Kurzantwort */}
                <section
                    className={cn(
                        "border-l-4 p-6 md:p-8",
                        S.card,
                        "border-l-[#DC2626] dark:border-l-[#F87171]"
                    )}
                >
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#DC2626] dark:text-[#F87171]" />
                        <div className="w-full">
                            <h2 className={cn("text-xl font-semibold", S.heading)}>{labels.quickAnswer}</h2>
                            <p className={cn("mt-2", S.muted)}>{data.summary || labels.quickIntro}</p>
                            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                {quickBullets.map((item) => (
                                    <li key={item} className={cn("flex gap-2 text-sm", S.heading)}>
                                        <span className={S.accent}>•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Ampelsystem */}
                <AustriaTrafficLights lang={lang} />

                {/* Vor der Fahrt */}
                <section>
                    <h2 className={cn("mb-4 text-xl font-semibold", S.heading)}>{labels.beforeDrive}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {preTripCards.map((card) => (
                            <PreTripCard key={card.title} {...card} />
                        ))}
                    </div>
                </section>

                {/* Warnings */}
                <section className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-red-900 dark:text-red-100">
                        <AlertTriangle className="h-5 w-5" />
                        {labels.keyRisks}
                    </h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {data.common_traps.map((trap) => (
                            <li
                                key={trap}
                                className="flex gap-2 text-sm leading-relaxed text-red-950/90 dark:text-red-50/90"
                            >
                                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626] dark:text-[#F87171]" />
                                <span>{trap}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Speed limits */}
                <section>
                    <h2 className={cn("mb-4 text-xl font-semibold", S.heading)}>{dict.rules.speed_limits}</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <SpeedLimitCard
                            label={labels.city}
                            value={rules.speed_limits.urban}
                            unit={speedUnit}
                            icon={Building2}
                        />
                        <SpeedLimitCard
                            label={labels.countryRoad}
                            value={rules.speed_limits.rural}
                            unit={speedUnit}
                            icon={Trees}
                        />
                        <SpeedLimitCard
                            label={labels.motorway}
                            value={rules.speed_limits.motorway}
                            unit={speedUnit}
                            icon={Car}
                        />
                    </div>
                    {rules.speed_limits.notes && (
                        <p className={cn("mt-4 text-sm", S.muted)}>{rules.speed_limits.notes}</p>
                    )}
                </section>

                {/* Info rows */}
                <section className="space-y-4">
                    <InfoRowCard title={labels.tollNeeded} text={rules.tolls.notes ?? ""} icon={CreditCard} />
                    <InfoRowCard
                        title={labels.mandatoryGear}
                        text={rules.mandatory_equipment.join(" · ")}
                        icon={Wrench}
                    />
                </section>

                {/* Sources */}
                <section>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className={cn("flex items-center gap-2 text-xl font-semibold", S.heading)}>
                            <BookOpen className="h-5 w-5 text-[#DC2626] dark:text-[#F87171]" />
                            {labels.sourcesTitle}
                        </h2>
                        <Link
                            href={`/${lang}/country/${data.iso2.toLowerCase()}/sources`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline dark:text-[#3B82F6]"
                        >
                            {labels.viewAllSources}
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {sourceEntries.length > 0 ? (
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
                                                getSourceTypeBadgeClass(source.sourceType)
                                            )}
                                        >
                                            {SOURCE_TYPE_LABELS[source.sourceType]} ·{" "}
                                            {TRUST_LEVEL_LABELS[source.trustLevel]}
                                        </span>
                                        <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <ul className={cn("space-y-1 text-sm", S.muted)}>
                            {data.sources.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Details accordion */}
                <section className={cn("p-6", S.card)}>
                    <h2 className={cn("mb-4 text-xl font-semibold", S.heading)}>{labels.details}</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                            value="phone"
                            className="border-[#E2E8F0] bg-[#F5F7FA] dark:border-slate-700 dark:bg-slate-800/40"
                        >
                            <AccordionTrigger className={S.heading}>
                                {dict.rules.phone_distractions}
                            </AccordionTrigger>
                            <AccordionContent className={S.muted}>{rules.phone_usage_rules}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem
                            value="lights"
                            className="border-[#E2E8F0] bg-[#F5F7FA] dark:border-slate-700 dark:bg-slate-800/40"
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

                <div className="mt-14">
                    <FeedbackForm labels={dict.extra} countryName={data.name_en} />
                </div>
            </main>
        </div>
    )
}
