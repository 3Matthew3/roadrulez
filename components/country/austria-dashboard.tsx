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

const AT = {
    bg: "#F5F7FB",
    card: "#FFFFFF",
    primary: "#1E40AF",
    accent: "#2563EB",
    text: "#0F172A",
    muted: "#475569",
    border: "#E2E8F0",
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
        <div
            className="rounded-2xl p-4 text-center shadow-sm"
            style={{ backgroundColor: AT.bg, border: `1px solid ${AT.border}` }}
        >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: AT.muted }}>
                {label}
            </p>
            <p className="mt-2 text-3xl font-bold" style={{ color: AT.text }}>
                {formatted.primary}
            </p>
            <p className="mt-1 text-xs" style={{ color: AT.muted }}>
                ({formatted.secondary})
            </p>
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
        {
            label: labels.driveSide,
            value: dict.common.right,
            icon: Car,
            accent: AT.primary,
        },
        {
            label: labels.speed,
            value: speedSummary,
            detail: speedSummaryAlt,
            icon: Gauge,
            accent: AT.accent,
        },
        {
            label: labels.alcohol,
            value: alcoholLabel(rules),
            detail: rules.alcohol_limit.notes,
            icon: Wine,
            accent: "#B45309",
        },
        {
            label: labels.tolls,
            value: rules.tolls.required ? dict.common.yes : dict.common.no,
            detail: rules.tolls.type,
            icon: CreditCard,
            accent: AT.primary,
        },
        {
            label: labels.emergency,
            value: rules.emergency_numbers[0] ?? "112",
            detail: rules.emergency_numbers.slice(1).join(" · "),
            icon: PhoneCall,
            accent: "#BE123C",
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
        <div className="min-h-screen" style={{ backgroundColor: AT.bg, color: AT.text }}>
            <CountryViewTracker iso2={data.iso2} />

            {/* Hero — same pattern as USA / CountryHero */}
            <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[#111]">
                    <HeroImage name={data.name_en} images={data.header_images} />
                    <div
                        className="absolute inset-0 z-10"
                        style={{
                            background:
                                "linear-gradient(to top, rgba(245,247,251,1) 0%, rgba(245,247,251,0.92) 35%, rgba(15,23,42,0.35) 100%)",
                        }}
                    />
                </div>

                <div className="container relative z-20 flex h-full flex-col justify-end px-4 pb-10 md:px-8 md:pb-12">
                    <p
                        className="mb-2 text-xs font-semibold uppercase tracking-[0.28em]"
                        style={{ color: AT.primary }}
                    >
                        {labels.guideTitle}
                    </p>
                    <div className="mb-4 flex items-center gap-5">
                        <div
                            className="relative h-16 w-24 overflow-hidden rounded-lg shadow-md md:h-20 md:w-32"
                            style={{ border: `1px solid ${AT.border}` }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://flagcdn.com/w320/${data.iso2.toLowerCase()}.png`}
                                alt={`${localizedName} flag`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-6xl" style={{ color: AT.text }}>
                                {localizedName}
                            </h1>
                            <div className="mt-2 flex items-center gap-2" style={{ color: AT.muted }}>
                                <Info className="h-4 w-4" style={{ color: AT.accent }} />
                                <span>
                                    {dict.props.drive_side}:{" "}
                                    <span className="font-semibold capitalize" style={{ color: AT.text }}>
                                        {driveSideLabel}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <Suspense fallback={<div className="h-10 w-56 animate-pulse rounded-lg bg-white/60" />}>
                            <VehicleSwitcher currentVehicle={vehicleType} labels={dict.vehicle} />
                        </Suspense>
                        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: AT.muted }}>
                            <span>
                                {dict.common.last_verified}: {data.last_verified}
                            </span>
                            <Badge
                                variant="outline"
                                className="uppercase text-[10px]"
                                style={{
                                    color: "#B45309",
                                    borderColor: "#FDE68A",
                                    backgroundColor: "#FFFBEB",
                                }}
                            >
                                {data.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container space-y-8 px-4 py-8 md:px-6 md:py-10">
                {/* Quick answer */}
                <section
                    className="rounded-3xl p-6 shadow-sm md:p-8"
                    style={{ backgroundColor: AT.card, border: `1px solid ${AT.border}` }}
                >
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-1 h-6 w-6 shrink-0" style={{ color: AT.accent }} />
                        <div>
                            <h2 className="text-xl font-semibold" style={{ color: AT.text }}>
                                {labels.quickAnswer}
                            </h2>
                            <p className="mt-2" style={{ color: AT.muted }}>
                                {labels.quickIntro}
                            </p>
                            <ul className="mt-4 space-y-2">
                                {quickBullets.map((item) => (
                                    <li key={item} className="flex gap-2 text-sm" style={{ color: AT.text }}>
                                        <span style={{ color: AT.accent }}>•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Stat cards */}
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {statCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <article
                                key={card.label}
                                className="rounded-2xl p-5 shadow-sm"
                                style={{ backgroundColor: AT.card, border: `1px solid ${AT.border}` }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm" style={{ color: AT.muted }}>
                                        {card.label}
                                    </p>
                                    <Icon className="h-5 w-5" style={{ color: card.accent }} />
                                </div>
                                <p className="mt-4 text-xl font-bold leading-snug" style={{ color: AT.text }}>
                                    {card.value}
                                </p>
                                {card.detail && (
                                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed" style={{ color: AT.muted }}>
                                        {card.detail}
                                    </p>
                                )}
                            </article>
                        )
                    })}
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-6">
                        <article
                            className="rounded-3xl p-6 shadow-sm"
                            style={{ backgroundColor: AT.card, border: `1px solid ${AT.border}` }}
                        >
                            <h2 className="flex items-center gap-2 text-xl font-semibold" style={{ color: AT.text }}>
                                <CheckCircle2 className="h-5 w-5" style={{ color: AT.accent }} />
                                {labels.beforeDrive}
                            </h2>
                            <ul className="mt-5 space-y-3">
                                {checklist.map((item) => (
                                    <li
                                        key={String(item)}
                                        className="flex gap-3 rounded-xl p-3 text-sm"
                                        style={{ backgroundColor: AT.bg, color: AT.muted }}
                                    >
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: AT.accent }} />
                                        <span>{String(item)}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>

                        <article
                            className="rounded-3xl p-6 shadow-sm"
                            style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}
                        >
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-amber-900">
                                <AlertTriangle className="h-5 w-5" />
                                {labels.keyRisks}
                            </h2>
                            <ul className="mt-5 space-y-3">
                                {data.common_traps.map((trap) => (
                                    <li key={trap} className="flex gap-3 text-sm leading-relaxed text-amber-950/80">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                        <span>{trap}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </div>

                    <div className="space-y-6">
                        <article
                            className="rounded-3xl p-6 shadow-sm"
                            style={{ backgroundColor: AT.card, border: `1px solid ${AT.border}` }}
                        >
                            <h2 className="flex items-center gap-2 text-xl font-semibold" style={{ color: AT.text }}>
                                <Gauge className="h-5 w-5" style={{ color: AT.accent }} />
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
                                <p className="mt-4 text-sm leading-relaxed" style={{ color: AT.muted }}>
                                    {rules.speed_limits.notes}
                                </p>
                            )}
                        </article>

                        <div className="grid gap-6 md:grid-cols-2">
                            <article
                                className="rounded-3xl p-6 shadow-sm"
                                style={{ backgroundColor: AT.card, border: `1px solid ${AT.border}` }}
                            >
                                <h3 className="flex items-center gap-2 font-semibold" style={{ color: AT.text }}>
                                    <CreditCard className="h-5 w-5" style={{ color: AT.primary }} />
                                    {labels.tollNeeded}
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed" style={{ color: AT.muted }}>
                                    {rules.tolls.notes}
                                </p>
                            </article>
                            <article
                                className="rounded-3xl p-6 shadow-sm"
                                style={{ backgroundColor: AT.card, border: `1px solid ${AT.border}` }}
                            >
                                <h3 className="flex items-center gap-2 font-semibold" style={{ color: AT.text }}>
                                    <Snowflake className="h-5 w-5" style={{ color: AT.accent }} />
                                    {dict.rules.mandatory_equipment}
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed" style={{ color: AT.muted }}>
                                    {rules.winter_rules}
                                </p>
                            </article>
                        </div>

                        <article
                            className="rounded-3xl p-6 shadow-sm"
                            style={{ backgroundColor: AT.card, border: `1px solid ${AT.border}` }}
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="font-semibold" style={{ color: AT.text }}>
                                    {dict.rules.sources}
                                </h3>
                                <Link
                                    href={`/${lang}/country/${data.iso2.toLowerCase()}/sources`}
                                    className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                                    style={{ color: AT.accent }}
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
                                            className="rounded-xl p-3"
                                            style={{ backgroundColor: AT.bg, border: `1px solid ${AT.border}` }}
                                        >
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                                                style={{ color: AT.text }}
                                            >
                                                {source.title}
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                            <p className="mt-1 text-[11px]" style={{ color: AT.muted }}>
                                                {SOURCE_TYPE_LABELS[source.sourceType]} ·{" "}
                                                {TRUST_LEVEL_LABELS[source.trustLevel]}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="space-y-1 text-sm" style={{ color: AT.muted }}>
                                    {data.sources.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            )}
                        </article>
                    </div>
                </section>

                <section
                    className="rounded-3xl p-6 shadow-sm"
                    style={{ backgroundColor: AT.card, border: `1px solid ${AT.border}` }}
                >
                    <h2 className="mb-5 text-xl font-semibold" style={{ color: AT.text }}>
                        {labels.details}
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="phone" style={{ borderColor: AT.border }}>
                            <AccordionTrigger className="hover:no-underline" style={{ color: AT.text }}>
                                {dict.rules.phone_distractions}
                            </AccordionTrigger>
                            <AccordionContent style={{ color: AT.muted }}>{rules.phone_usage_rules}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="lights" style={{ borderColor: AT.border }}>
                            <AccordionTrigger className="hover:no-underline" style={{ color: AT.text }}>
                                {dict.rules.lights_parking}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2" style={{ color: AT.muted }}>
                                <p>
                                    <strong style={{ color: AT.text }}>{dict.props.headlights}:</strong>{" "}
                                    {rules.headlights_rules}
                                </p>
                                <p>
                                    <strong style={{ color: AT.text }}>{dict.props.parking}:</strong>{" "}
                                    {rules.parking_rules}
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>

                <div className="border-t pt-8" style={{ borderColor: AT.border }}>
                    <FeedbackForm labels={dict.extra} countryName={data.name_en} />
                </div>
            </main>
        </div>
    )
}
