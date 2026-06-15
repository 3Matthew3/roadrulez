import { Building2, Info, Trees, type LucideIcon } from "lucide-react"
import { MotorwayPictogramIcon, type SpeedLimitScene } from "@/components/country/speed-limit-illustrations"
import { COUNTRY_CARD, COUNTRY_PREMIUM as S } from "@/lib/country-premium-styles"
import { alternateSpeedUnit, convertSpeedValue, type SpeedUnit } from "@/lib/speed-display"
import { cn } from "@/lib/utils"

interface AustriaSpeedLimitsSectionProps {
    title: string
    urban: number
    rural: number
    motorway: number
    unit: SpeedUnit
    notes?: string
    lang: string
    labels: {
        city: string
        countryRoad: string
        motorway: string
    }
}

const SCENE_CONFIG: Record<
    SpeedLimitScene,
    {
        Icon?: LucideIcon
        useMotorwayPictogram?: boolean
        accent: string
        pill: string
        pillDark: string
        iconWrap: string
        iconWrapDark: string
    }
> = {
    urban: {
        Icon: Building2,
        accent: "text-red-500 dark:text-red-400",
        pill: "bg-red-50 text-red-600",
        pillDark: "dark:bg-red-500/15 dark:text-red-300",
        iconWrap: "bg-red-50 text-red-500",
        iconWrapDark: "dark:bg-red-500/15 dark:text-red-400",
    },
    rural: {
        Icon: Trees,
        accent: "text-emerald-600 dark:text-emerald-400",
        pill: "bg-emerald-50 text-emerald-700",
        pillDark: "dark:bg-emerald-500/15 dark:text-emerald-300",
        iconWrap: "bg-emerald-50 text-emerald-600",
        iconWrapDark: "dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    motorway: {
        useMotorwayPictogram: true,
        accent: "text-blue-600 dark:text-blue-400",
        pill: "bg-blue-50 text-blue-700",
        pillDark: "dark:bg-blue-500/15 dark:text-blue-300",
        iconWrap: "bg-blue-50 text-blue-600",
        iconWrapDark: "dark:bg-blue-500/15 dark:text-blue-400",
    },
}

function splitNotes(notes: string) {
    const match = notes.match(/^(.+?\.\s*)([\s\S]*)$/)
    if (!match) return { lead: notes, rest: "" }
    return { lead: match[1].trim(), rest: match[2].trim() }
}

function SceneIcon({
    config,
    className,
}: {
    config: (typeof SCENE_CONFIG)[SpeedLimitScene]
    className?: string
}) {
    if (config.useMotorwayPictogram) {
        return <MotorwayPictogramIcon className={className} />
    }
    const Icon = config.Icon
    return Icon ? <Icon className={className} aria-hidden="true" /> : null
}

function AustriaSpeedLimitCard({
    label,
    value,
    unit,
    scene,
    defaultLimitLabel,
}: {
    label: string
    value: number
    unit: SpeedUnit
    scene: SpeedLimitScene
    defaultLimitLabel: string
}) {
    const config = SCENE_CONFIG[scene]
    const altUnit = alternateSpeedUnit(unit)
    const altValue = convertSpeedValue(value, unit)

    return (
        <article
            className={cn(
                "flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FAFBFC] text-center shadow-sm",
                "dark:border-slate-600 dark:bg-[#2A3444]"
            )}
        >
            <div className="flex flex-1 flex-col items-center px-4 pb-4 pt-4">
                <div
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        config.iconWrap,
                        config.iconWrapDark
                    )}
                >
                    <SceneIcon config={config} className="h-5 w-5" />
                </div>

                <p
                    className={cn(
                        "mt-2.5 text-xs font-semibold uppercase tracking-[0.16em] sm:text-sm",
                        config.accent
                    )}
                >
                    {label}
                </p>

                <span
                    className={cn(
                        "mt-1.5 inline-flex rounded-2xl border border-[#E2E8F0]/90 bg-white px-3 py-1 text-[10px] font-medium text-[#64748B]",
                        "dark:border-slate-500/40 dark:bg-[#3D4A5C] dark:text-slate-300"
                    )}
                >
                    {defaultLimitLabel}
                </span>

                <p className="mt-2 flex items-baseline justify-center gap-1.5 leading-none">
                    <span
                        className={cn(
                            "text-5xl font-bold tabular-nums tracking-tight sm:text-[3.25rem]",
                            S.heading
                        )}
                    >
                        {value}
                    </span>
                    <span className={cn("text-base font-medium sm:text-lg", S.muted)}>{unit}</span>
                </p>

                <span
                    className={cn(
                        "mt-2 inline-flex rounded-2xl px-3 py-1 text-sm font-medium",
                        config.pill,
                        config.pillDark
                    )}
                >
                    {altValue} {altUnit}
                </span>
            </div>
        </article>
    )
}

export default function AustriaSpeedLimitsSection({
    title,
    urban,
    rural,
    motorway,
    unit,
    notes,
    lang,
    labels,
}: AustriaSpeedLimitsSectionProps) {
    const isGerman = lang === "de"
    const subtitle = isGerman
        ? "Höchstgeschwindigkeiten nach Straßentyp"
        : "Maximum speed limits by road type"
    const noteParts = notes ? splitNotes(notes) : null

    const copy = {
        defaultLimit: isGerman ? "Standardlimit" : "Default limit",
    }

    return (
        <section className={cn("overflow-hidden", COUNTRY_CARD)}>
            <div className="p-5 md:p-6">
                <h3 className={cn("text-lg font-semibold", S.heading)}>{title}</h3>
                <p className={cn("mt-1 text-sm", S.muted)}>{subtitle}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <AustriaSpeedLimitCard
                        label={labels.city}
                        value={urban}
                        unit={unit}
                        scene="urban"
                        defaultLimitLabel={copy.defaultLimit}
                    />
                    <AustriaSpeedLimitCard
                        label={labels.countryRoad}
                        value={rural}
                        unit={unit}
                        scene="rural"
                        defaultLimitLabel={copy.defaultLimit}
                    />
                    <AustriaSpeedLimitCard
                        label={labels.motorway}
                        value={motorway}
                        unit={unit}
                        scene="motorway"
                        defaultLimitLabel={copy.defaultLimit}
                    />
                </div>
            </div>
            {notes && noteParts && (
                <div className="flex gap-3 border-t border-blue-100 bg-blue-50/80 px-5 py-4 dark:border-blue-900/40 dark:bg-blue-950/20 md:px-6">
                    <Info
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400"
                        aria-hidden="true"
                    />
                    <p className={cn("text-sm leading-relaxed", S.muted)}>
                        <strong className="font-semibold text-[#0F172A] dark:text-slate-100">
                            {noteParts.lead}
                        </strong>
                        {noteParts.rest ? ` ${noteParts.rest}` : ""}
                    </p>
                </div>
            )}
        </section>
    )
}
