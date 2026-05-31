import Link from "next/link"
import {
    AlertTriangle,
    BadgeCheck,
    BookOpen,
    Car,
    CheckCircle2,
    CreditCard,
    Gauge,
    MapPin,
    PhoneCall,
    ShieldCheck,
    Snowflake,
    Wine,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CountryViewTracker } from "@/components/country-view-tracker"
import FeedbackForm from "@/components/country/feedback-form"
import VehicleSwitcher from "@/components/country/vehicle-switcher"
import DetailedRulesAccordion from "@/components/country/modular/DetailedRulesAccordion"
import SourcesCard from "@/components/country/modular/SourcesCard"
import { CountryData, TrafficRules } from "@/types/country"

interface AustriaDashboardProps {
    data: CountryData
    localizedName: string
    dict: any
    lang: string
    vehicleType: string
    rules: TrafficRules
}

function alcoholLabel(rules: TrafficRules) {
    if (rules.alcohol_limit.unit === "BAC") {
        return `${rules.alcohol_limit.value.toFixed(2)}% BAC`
    }

    return `${rules.alcohol_limit.value} ${rules.alcohol_limit.unit}`
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
    const labels = {
        testLayout: isGerman ? "Layout-Test" : "Layout test",
        dashboard: isGerman ? "Reise-Dashboard" : "Travel dashboard",
        overview: isGerman
            ? "Die wichtigsten Fahrregeln auf einen Blick - danach kommen Checkliste, Stolperfallen und Details."
            : "The most important driving rules first - followed by checklist, traps, and details.",
        quickAnswer: isGerman ? "Sofort-Antwort" : "Quick answer",
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
        verified: isGerman ? "Geprüft" : "Verified",
        coverage: isGerman ? "Datenqualität" : "Coverage",
        compareHint: isGerman
            ? "Diese Seite nutzt bewusst ein anderes Layout als die übrigen Länder."
            : "This page intentionally uses a different layout than the other countries.",
    }

    const statCards = [
        {
            label: labels.driveSide,
            value: dict.common.right,
            icon: Car,
            accent: "text-sky-300",
        },
        {
            label: labels.speed,
            value: `${rules.speed_limits.urban}/${rules.speed_limits.rural}/${rules.speed_limits.motorway}`,
            detail: rules.speed_limits.units,
            icon: Gauge,
            accent: "text-emerald-300",
        },
        {
            label: labels.alcohol,
            value: alcoholLabel(rules),
            detail: rules.alcohol_limit.notes,
            icon: Wine,
            accent: "text-amber-300",
        },
        {
            label: labels.tolls,
            value: rules.tolls.required ? dict.common.yes : dict.common.no,
            detail: rules.tolls.type,
            icon: CreditCard,
            accent: "text-violet-300",
        },
        {
            label: labels.emergency,
            value: rules.emergency_numbers[0] ?? "112",
            detail: rules.emergency_numbers.slice(1).join(" · "),
            icon: PhoneCall,
            accent: "text-rose-300",
        },
    ]

    const checklist = [
        rules.tolls.required ? rules.tolls.notes : null,
        data.rental_and_idp_notes,
        rules.winter_rules,
        ...rules.mandatory_equipment.map((item) => `${dict.rules.mandatory_equipment}: ${item}`),
    ].filter(Boolean)

    return (
        <div className="min-h-screen bg-[#070b12] text-slate-100">
            <CountryViewTracker iso2={data.iso2} />

            <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_34%),linear-gradient(135deg,#09111f,#121827_52%,#08111f)]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
                <div className="container relative px-4 py-12 md:px-6 md:py-16">
                    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="border-sky-400/30 bg-sky-400/10 text-sky-200 hover:bg-sky-400/10">
                                    {labels.testLayout}
                                </Badge>
                                <Badge variant="outline" className="border-emerald-400/30 text-emerald-200">
                                    {labels.verified}: {data.last_verified}
                                </Badge>
                                {data.data_coverage && (
                                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                                        {labels.coverage}: {data.data_coverage}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="relative h-16 w-24 overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://flagcdn.com/w320/${data.iso2.toLowerCase()}.png`}
                                        alt={`${localizedName} flag`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-[0.35em] text-sky-200/80">
                                        {labels.dashboard}
                                    </p>
                                    <h1 className="mt-2 text-5xl font-black tracking-tight text-white md:text-7xl">
                                        {localizedName}
                                    </h1>
                                </div>
                            </div>

                            <p className="max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
                                {labels.overview}
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <VehicleSwitcher currentVehicle={vehicleType} labels={dict.vehicle} />
                                <Link
                                    href={`/${lang}/country/${data.iso2.toLowerCase()}/sources`}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-sky-500/60 hover:text-white"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    {labels.sources}
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-1 h-6 w-6 text-emerald-300" />
                                <div>
                                    <h2 className="text-xl font-semibold text-white">{labels.quickAnswer}</h2>
                                    <p className="mt-3 leading-relaxed text-slate-300">{data.summary}</p>
                                </div>
                            </div>
                            <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                                {labels.compareHint}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container px-4 py-8 md:px-6 md:py-10">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {statCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <article
                                key={card.label}
                                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-slate-400">{card.label}</p>
                                    <Icon className={`h-5 w-5 ${card.accent}`} />
                                </div>
                                <p className="mt-4 text-2xl font-bold text-white">{card.value}</p>
                                {card.detail && (
                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                                        {card.detail}
                                    </p>
                                )}
                            </article>
                        )
                    })}
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-6">
                        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                                {labels.beforeDrive}
                            </h2>
                            <ul className="mt-5 space-y-3">
                                {checklist.map((item) => (
                                    <li key={String(item)} className="flex gap-3 rounded-xl bg-slate-950/50 p-3 text-sm text-slate-300">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                        <span>{String(item)}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>

                        <article className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-amber-100">
                                <AlertTriangle className="h-5 w-5" />
                                {labels.keyRisks}
                            </h2>
                            <ul className="mt-5 space-y-3">
                                {data.common_traps.map((trap) => (
                                    <li key={trap} className="flex gap-3 text-sm leading-relaxed text-amber-50/80">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                                        <span>{trap}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </div>

                    <div className="space-y-6">
                        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                                <Gauge className="h-5 w-5 text-sky-300" />
                                {dict.rules.speed_limits}
                            </h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                {[
                                    [labels.city, rules.speed_limits.urban],
                                    [labels.countryRoad, rules.speed_limits.rural],
                                    [labels.motorway, rules.speed_limits.motorway],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-2xl bg-slate-950/50 p-4 text-center">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                                        <p className="mt-2 text-3xl font-black text-white">{value}</p>
                                        <p className="text-xs text-slate-500">{rules.speed_limits.units}</p>
                                    </div>
                                ))}
                            </div>
                            {rules.speed_limits.notes && (
                                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                                    {rules.speed_limits.notes}
                                </p>
                            )}
                        </article>

                        <div className="grid gap-6 md:grid-cols-2">
                            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                                <h3 className="flex items-center gap-2 font-semibold text-white">
                                    <CreditCard className="h-5 w-5 text-violet-300" />
                                    {labels.tollNeeded}
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed text-slate-300">{rules.tolls.notes}</p>
                            </article>
                            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                                <h3 className="flex items-center gap-2 font-semibold text-white">
                                    <Snowflake className="h-5 w-5 text-sky-300" />
                                    {dict.rules.mandatory_equipment}
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed text-slate-300">{rules.winter_rules}</p>
                            </article>
                        </div>

                        <SourcesCard data={data} dict={dict} lang={lang} compact />
                    </div>
                </section>

                <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <div className="mb-5 flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-sky-300" />
                        <h2 className="text-xl font-semibold text-white">{labels.details}</h2>
                    </div>
                    <DetailedRulesAccordion rules={rules} dict={dict} />
                </section>

                <div className="mt-8 border-t border-slate-800 pt-8">
                    <FeedbackForm labels={dict.extra} countryName={data.name_en} />
                </div>
            </main>
        </div>
    )
}
