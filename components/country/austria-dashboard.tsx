import Link from "next/link"
import { Suspense } from "react"
import {
    AlertTriangle,
    BookOpen,
    Car,
    CheckCircle2,
    CreditCard,
    ExternalLink,
    Gauge,
    Info,
    MapPin,
    PhoneCall,
    ShieldCheck,
    Snowflake,
    Wine,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CountryViewTracker } from "@/components/country-view-tracker"
import FeedbackForm from "@/components/country/feedback-form"
import HeroImage from "@/components/country/hero-image"
import VehicleSwitcher from "@/components/country/vehicle-switcher"
import { cn } from "@/lib/utils"
import { CountryData, TrafficRules } from "@/types/country"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"
import { formatSpeedWithConversion, type SpeedUnit } from "@/lib/speed-display"

interface AustriaDashboardProps {
    data: CountryData
    localizedName: string
    dict: any
    lang: string
    vehicleType: string
    rules: TrafficRules
}

/** Unified light/dark palette */
const S = {
    page: "min-h-screen bg-[#F5F7FA] text-[#0F172A] dark:bg-[#0F172A] dark:text-[#F8FAFC]",
    card: "rounded-3xl bg-white border border-[#E2E8F0] shadow-sm dark:bg-[#1E293B] dark:border-slate-700",
    cardSm: "rounded-2xl bg-white border border-[#E2E8F0] shadow-sm dark:bg-[#1E293B] dark:border-slate-700",
    muted: "text-[#475569] dark:text-slate-400",
    heading: "text-[#0F172A] dark:text-[#F8FAFC]",
    eyebrow: "text-[#2563EB] dark:text-[#3B82F6]",
    accent: "text-[#2563EB] dark:text-[#3B82F6]",
    primary: "text-[#2563EB] dark:text-[#3B82F6]",
    soft: "bg-[#F5F7FA] dark:bg-slate-800/40",
    border: "border-[#E2E8F0] dark:border-slate-700",
    heroGradLight:
        "absolute inset-0 z-10 bg-gradient-to-t from-[#F5F7FA] via-[#F5F7FA]/90 to-slate-900/30 dark:hidden",
    heroGradDark:
        "absolute inset-0 z-10 hidden bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent dark:block",
    statusBadge:
        "uppercase text-[10px] text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-500/20 dark:bg-amber-500/10",
    trapsCard:
        "rounded-3xl p-6 shadow-sm bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20",
    trapsTitle: "text-amber-900 dark:text-amber-100",
    trapsText: "text-amber-950/80 dark:text-amber-50/80",
} as const

function alcoholLabel(rules: TrafficRules) {
    if (rules.alcohol_limit.unit === "BAC") {
        return `${rules.alcohol_limit.value.toFixed(2)}% BAC`
    }
    return `${rules.alcohol_limit.value} ${rules.alcohol_limit.unit}`
}

function SpeedLimitCell({
    label,
    value,
    unit,
}: {
    label: string
    value: number
    unit: SpeedUnit
}) {
    const formatted = formatSpeedWithConversion(value, unit)
    return (
        <div className={cn("rounded-2xl p-4 text-center shadow-sm", S.soft, S.border, "border")}>
            <p className={cn("text-xs font-medium uppercase tracking-wide", S.muted)}>{label}</p>
            <p className={cn("mt-2 text-3xl font-bold", S.heading)}>{formatted.primary}</p>
            <p className={cn("mt-1 text-xs", S.muted)}>({formatted.secondary})</p>
        </div>
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

    const labels = {
        guideTitle: isGerman ? "Fahrleitfaden Österreich" : "Driving Guide Austria",
        quickAnswer: isGerman ? "Kurzantwort" : "Quick answer",
        quickIntro: isGerman
            ? "Österreich ist unkompliziert zum Fahren, aber beachte:"
            : "Austria is easy to drive in, but remember:",
        beforeDrive: isGerman ? "Vor der Fahrt prüfen" : "Before you drive",
        keyRisks: isGerman ? "Worauf du achten solltest" : "What to watch",
        details: isGerman ? "Details bei Bedarf" : "Details when needed",
        sources: isGerman ? "Quellen & Verifikation" : "Sources & verification",
        tollNeeded: isGerman ? "Vignette nötig" : "Vignette needed",
        emergency: isGerman ? "Notruf" : "Emergency",
        driveSide: isGerman ? "Rechtsverkehr" : "Drives right",
        speed: isGerman ? "Tempo" : "Speed",
        alcohol: isGerman ? "Alkohol" : "Alcohol",
        tolls: isGerman ? "Maut" : "Tolls",
        city: isGerman ? "Stadt" : "Urban",
        countryRoad: isGerman ? "Landstraße" : "Rural",
        motorway: isGerman ? "Autobahn" : "Motorway",
        viewAllSources: dict.sources_page?.view_all ?? "All sources",
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

    const speedSummaryAlt = [rules.speed_limits.urban, rules.speed_limits.rural, rules.speed_limits.motorway]
        .map((v) => formatSpeedWithConversion(v, speedUnit).secondary)
        .join(" · ")

    const statCards = [
        { label: labels.driveSide, value: dict.common.right, icon: Car, iconClass: S.primary },
        { label: labels.speed, value: speedSummary, detail: speedSummaryAlt, icon: Gauge, iconClass: S.accent },
        {
            label: labels.alcohol,
            value: alcoholLabel(rules),
            detail: rules.alcohol_limit.notes,
            icon: Wine,
            iconClass: "text-amber-700 dark:text-amber-300",
        },
        {
            label: labels.tolls,
            value: rules.tolls.required ? dict.common.yes : dict.common.no,
            detail: rules.tolls.type,
            icon: CreditCard,
            iconClass: S.primary,
        },
        {
            label: labels.emergency,
            value: rules.emergency_numbers[0] ?? "112",
            detail: rules.emergency_numbers.slice(1).join(" · "),
            icon: PhoneCall,
            iconClass: "text-rose-600 dark:text-rose-300",
        },
    ]

    const checklist = [
        rules.tolls.required ? rules.tolls.notes : null,
        data.rental_and_idp_notes,
        rules.winter_rules,
        ...rules.mandatory_equipment.map((item) => `${dict.rules.mandatory_equipment}: ${item}`),
    ].filter(Boolean)

    const sourceEntries = data.source_entries ?? []
    const driveSideLabel = dict.common.right

    return (
        <div className={S.page}>
            <CountryViewTracker iso2={data.iso2} />

            <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[#111]">
                    <HeroImage name={data.name_en} images={data.header_images} />
                    <div className={S.heroGradLight} />
                    <div className={S.heroGradDark} />
                </div>

                <div className="container relative z-20 flex h-full flex-col justify-end px-4 pb-10 md:px-8 md:pb-12">
                    <p className={cn("mb-2 text-xs font-semibold uppercase tracking-[0.28em]", S.eyebrow)}>
                        {labels.guideTitle}
                    </p>
                    <div className="mb-4 flex items-center gap-5">
                        <div
                            className={cn(
                                "relative h-16 w-24 overflow-hidden rounded-lg shadow-md md:h-20 md:w-32 border",
                                S.border
                            )}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://flagcdn.com/w320/${data.iso2.toLowerCase()}.png`}
                                alt={`${localizedName} flag`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className={cn("text-4xl font-bold tracking-tight md:text-6xl", S.heading)}>
                                {localizedName}
                            </h1>
                            <div className={cn("mt-2 flex items-center gap-2", S.muted)}>
                                <Info className={cn("h-4 w-4", S.accent)} />
                                <span>
                                    {dict.props.drive_side}:{" "}
                                    <span className={cn("font-semibold capitalize", S.heading)}>
                                        {driveSideLabel}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <Suspense
                            fallback={
                                <div className="h-10 w-56 animate-pulse rounded-lg bg-white/60 dark:bg-slate-800/60" />
                            }
                        >
                            <VehicleSwitcher currentVehicle={vehicleType} labels={dict.vehicle} />
                        </Suspense>
                        <div className={cn("flex flex-wrap items-center gap-3 text-xs", S.muted)}>
                            <span>
                                {dict.common.last_verified}: {data.last_verified}
                            </span>
                            <Badge variant="outline" className={S.statusBadge}>
                                {data.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container space-y-8 px-4 py-8 md:px-6 md:py-10">
                <section className={cn("p-6 md:p-8", S.card)}>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className={cn("mt-1 h-6 w-6 shrink-0", S.accent)} />
                        <div>
                            <h2 className={cn("text-xl font-semibold", S.heading)}>{labels.quickAnswer}</h2>
                            <p className={cn("mt-2", S.muted)}>{labels.quickIntro}</p>
                            <ul className="mt-4 space-y-2">
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

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {statCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <article key={card.label} className={cn("p-5", S.cardSm)}>
                                <div className="flex items-center justify-between gap-3">
                                    <p className={cn("text-sm", S.muted)}>{card.label}</p>
                                    <Icon className={cn("h-5 w-5", card.iconClass)} />
                                </div>
                                <p className={cn("mt-4 text-xl font-bold leading-snug", S.heading)}>{card.value}</p>
                                {card.detail && (
                                    <p className={cn("mt-2 line-clamp-3 text-xs leading-relaxed", S.muted)}>
                                        {card.detail}
                                    </p>
                                )}
                            </article>
                        )
                    })}
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-6">
                        <article className={cn("p-6", S.card)}>
                            <h2 className={cn("flex items-center gap-2 text-xl font-semibold", S.heading)}>
                                <CheckCircle2 className={cn("h-5 w-5", S.accent)} />
                                {labels.beforeDrive}
                            </h2>
                            <ul className="mt-5 space-y-3">
                                {checklist.map((item) => (
                                    <li
                                        key={String(item)}
                                        className={cn("flex gap-3 rounded-xl p-3 text-sm", S.soft, S.muted)}
                                    >
                                        <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", S.accent)} />
                                        <span>{String(item)}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>

                        <article className={S.trapsCard}>
                            <h2 className={cn("flex items-center gap-2 text-xl font-semibold", S.trapsTitle)}>
                                <AlertTriangle className="h-5 w-5" />
                                {labels.keyRisks}
                            </h2>
                            <ul className="mt-5 space-y-3">
                                {data.common_traps.map((trap) => (
                                    <li key={trap} className={cn("flex gap-3 text-sm leading-relaxed", S.trapsText)}>
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                                        <span>{trap}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </div>

                    <div className="space-y-6">
                        <article className={cn("p-6", S.card)}>
                            <h2 className={cn("flex items-center gap-2 text-xl font-semibold", S.heading)}>
                                <Gauge className={cn("h-5 w-5", S.accent)} />
                                {dict.rules.speed_limits}
                            </h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <SpeedLimitCell label={labels.city} value={rules.speed_limits.urban} unit={speedUnit} />
                                <SpeedLimitCell
                                    label={labels.countryRoad}
                                    value={rules.speed_limits.rural}
                                    unit={speedUnit}
                                />
                                <SpeedLimitCell
                                    label={labels.motorway}
                                    value={rules.speed_limits.motorway}
                                    unit={speedUnit}
                                />
                            </div>
                            {rules.speed_limits.notes && (
                                <p className={cn("mt-4 text-sm leading-relaxed", S.muted)}>
                                    {rules.speed_limits.notes}
                                </p>
                            )}
                        </article>

                        <div className="grid gap-6 md:grid-cols-2">
                            <article className={cn("p-6", S.card)}>
                                <h3 className={cn("flex items-center gap-2 font-semibold", S.heading)}>
                                    <CreditCard className={cn("h-5 w-5", S.primary)} />
                                    {labels.tollNeeded}
                                </h3>
                                <p className={cn("mt-4 text-sm leading-relaxed", S.muted)}>{rules.tolls.notes}</p>
                            </article>
                            <article className={cn("p-6", S.card)}>
                                <h3 className={cn("flex items-center gap-2 font-semibold", S.heading)}>
                                    <Snowflake className={cn("h-5 w-5", S.accent)} />
                                    {dict.rules.mandatory_equipment}
                                </h3>
                                <p className={cn("mt-4 text-sm leading-relaxed", S.muted)}>{rules.winter_rules}</p>
                            </article>
                        </div>

                        <article className={cn("p-6", S.card)}>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className={cn("font-semibold", S.heading)}>{dict.rules.sources}</h3>
                                <Link
                                    href={`/${lang}/country/${data.iso2.toLowerCase()}/sources`}
                                    className={cn("inline-flex items-center gap-1 text-xs font-medium hover:underline", S.accent)}
                                >
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {labels.viewAllSources}
                                </Link>
                            </div>
                            {sourceEntries.length > 0 ? (
                                <ul className="space-y-3">
                                    {sourceEntries.slice(0, 4).map((source) => (
                                        <li
                                            key={source.id}
                                            className={cn("rounded-xl p-3 border", S.soft, S.border)}
                                        >
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 text-sm font-medium hover:underline",
                                                    S.heading
                                                )}
                                            >
                                                {source.title}
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                            <p className={cn("mt-1 text-[11px]", S.muted)}>
                                                {SOURCE_TYPE_LABELS[source.sourceType]} ·{" "}
                                                {TRUST_LEVEL_LABELS[source.trustLevel]}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className={cn("space-y-1 text-sm", S.muted)}>
                                    {data.sources.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            )}
                        </article>
                    </div>
                </section>

                <section className={cn("p-6 md:p-8", S.card)}>
                    <h2 className={cn("mb-5 text-xl font-semibold", S.heading)}>{labels.details}</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="phone" className="border-[#E2E8F0] bg-[#F5F7FA] dark:border-slate-700 dark:bg-slate-800/40">
                            <AccordionTrigger className={S.heading}>{dict.rules.phone_distractions}</AccordionTrigger>
                            <AccordionContent className={S.muted}>{rules.phone_usage_rules}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="lights" className="border-[#E2E8F0] bg-[#F5F7FA] dark:border-slate-700 dark:bg-slate-800/40">
                            <AccordionTrigger className={S.heading}>{dict.rules.lights_parking}</AccordionTrigger>
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
