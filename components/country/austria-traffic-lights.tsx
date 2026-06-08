import { ArrowRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type LightState = "red" | "yellow" | "green" | "green-blink"

interface AustriaTrafficLightsProps {
    lang: string
}

function HeaderTrafficLightIcon() {
    return (
        <svg viewBox="0 0 24 32" className="h-6 w-5 text-[#DC2626] dark:text-[#F87171]" aria-hidden="true">
            <rect x="4" y="2" width="16" height="28" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="9" r="3" fill="#EF4444" />
            <circle cx="12" cy="16" r="3" fill="#374151" fillOpacity="0.5" />
            <circle cx="12" cy="23" r="3" fill="#374151" fillOpacity="0.5" />
        </svg>
    )
}

function TrafficLightIcon({ state }: { state: LightState }) {
    const active = {
        red: { r: true, y: false, g: false },
        yellow: { r: false, y: true, g: false },
        green: { r: false, y: false, g: true },
        "green-blink": { r: false, y: false, g: true },
    }[state]

    const blink = state === "green-blink"

    return (
        <div className="relative">
            {blink && (
                <span
                    className="absolute inset-0 -m-1 animate-pulse rounded-xl bg-emerald-400/20"
                    aria-hidden="true"
                />
            )}
            <div className="relative flex flex-col gap-1.5 rounded-xl border border-slate-600 bg-slate-900 px-2.5 py-2 dark:border-slate-600 dark:bg-slate-950">
                <span
                    className={cn(
                        "h-3.5 w-3.5 rounded-full border border-black/20",
                        active.r ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]" : "bg-red-950/80"
                    )}
                />
                <span
                    className={cn(
                        "h-3.5 w-3.5 rounded-full border border-black/20",
                        active.y ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]" : "bg-amber-950/80"
                    )}
                />
                <span
                    className={cn(
                        "h-3.5 w-3.5 rounded-full border border-black/20",
                        active.g ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" : "bg-emerald-950/80",
                        blink && "animate-pulse"
                    )}
                />
            </div>
        </div>
    )
}

function SequenceStep({
    state,
    title,
    subtitle,
}: {
    state: LightState
    title?: string
    subtitle?: string
}) {
    return (
        <div className="flex shrink-0 flex-col items-center gap-2">
            <TrafficLightIcon state={state} />
            {title && <p className="text-xs font-semibold text-white">{title}</p>}
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>
    )
}

function SequenceArrow() {
    return <ArrowRight className="mt-4 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
}

function CountryCompareRow({
    flag,
    name,
    note,
    sequence,
}: {
    flag: string
    name: string
    note: string
    sequence: React.ReactNode
}) {
    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 dark:border-slate-700 dark:bg-[#1E293B]">
            <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flag} alt="" className="mt-0.5 h-5 w-7 rounded-sm object-cover" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{note}</p>
                    <p className="mt-2 text-sm">{sequence}</p>
                </div>
            </div>
        </div>
    )
}

export default function AustriaTrafficLights({ lang }: AustriaTrafficLightsProps) {
    const isGerman = lang === "de"

    const t = {
        title: isGerman ? "Ampelsystem in Österreich" : "Traffic lights in Austria",
        badge: isGerman ? "Besonderheit" : "Special feature",
        intro: isGerman
            ? "In Österreich blinkt Grün vor Gelb. Es gibt kein Rot+Gelb gleichzeitig."
            : "In Austria, green flashes before yellow. There is no red+yellow phase together.",
        red: isGerman ? "Rot" : "Red",
        stop: isGerman ? "Stopp" : "Stop",
        greenBlink: isGerman ? "Grün blinkt" : "Green flashes",
        fourTimes: isGerman ? "4-mal" : "4 times",
        yellow: isGerman ? "Gelb" : "Yellow",
        caution: isGerman ? "Achtung" : "Caution",
        info: isGerman
            ? "Das grüne Blinklicht bedeutet: Die Ampel wird bald gelb."
            : "Flashing green means the light will turn yellow soon.",
        compareTitle: isGerman ? "Vergleich mit anderen Ländern" : "Comparison with other countries",
        deName: isGerman ? "Deutschland" : "Germany",
        deNote: isGerman ? "Kein Grünblinken." : "No green flashing phase.",
        ukName: isGerman ? "Großbritannien" : "United Kingdom",
        ukNote: isGerman
            ? "Rot und Gelb leuchten gemeinsam vor Grün."
            : "Red and yellow light up together before green.",
        usName: "USA",
        usNote: isGerman ? "Je nach Bundesstaat unterschiedlich." : "Varies by state.",
        usMostly: isGerman ? "Meist:" : "Usually:",
        green: isGerman ? "Grün" : "Green",
        yellow: isGerman ? "Gelb" : "Yellow",
        redLabel: isGerman ? "Rot" : "Red",
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-2xl border border-[#DC2626]/40 bg-white p-5 shadow-sm dark:border-[#F87171]/35 dark:bg-[#1E293B] md:p-6">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171]">
                        <HeaderTrafficLightIcon />
                    </div>
                    <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{t.title}</h2>
                    <span className="rounded-full border border-[#DC2626]/40 bg-[#DC2626]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#DC2626] dark:text-[#F87171]">
                        {t.badge}
                    </span>
                </div>

                <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">{t.intro}</p>

                <div className="overflow-x-auto pb-2">
                    <div className="flex min-w-max items-start gap-2 md:gap-3">
                        <SequenceStep state="red" title={t.red} subtitle={t.stop} />
                        <SequenceArrow />
                        <SequenceStep state="green" />
                        <SequenceArrow />
                        <SequenceStep state="green-blink" title={t.greenBlink} subtitle={t.fourTimes} />
                        <SequenceArrow />
                        <SequenceStep state="green-blink" />
                        <SequenceArrow />
                        <SequenceStep state="yellow" title={t.yellow} subtitle={t.caution} />
                        <SequenceArrow />
                        <SequenceStep state="red" title={t.red} subtitle={t.stop} />
                    </div>
                </div>

                <div className="mt-5 flex gap-3 rounded-xl border border-[#DC2626]/25 bg-[#DC2626]/5 p-4 dark:border-[#F87171]/25 dark:bg-red-500/10">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626] dark:text-[#F87171]" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">{t.info}</p>
                </div>
            </article>

            <div>
                <h3 className="mb-4 text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{t.compareTitle}</h3>
                <div className="space-y-3">
                    <CountryCompareRow
                        flag="https://flagcdn.com/w40/de.png"
                        name={t.deName}
                        note={t.deNote}
                        sequence={
                            <>
                                <span className="font-medium text-emerald-500">{t.green}</span>
                                <span className="text-slate-400"> → </span>
                                <span className="font-medium text-amber-400">{t.yellow}</span>
                                <span className="text-slate-400"> → </span>
                                <span className="font-medium text-red-500">{t.redLabel}</span>
                            </>
                        }
                    />
                    <CountryCompareRow
                        flag="https://flagcdn.com/w40/gb.png"
                        name={t.ukName}
                        note={t.ukNote}
                        sequence={
                            <>
                                <span className="font-medium text-red-500">{t.redLabel}</span>
                                <span className="text-slate-400"> + </span>
                                <span className="font-medium text-amber-400">{t.yellow}</span>
                                <span className="text-slate-400"> → </span>
                                <span className="font-medium text-emerald-500">{t.green}</span>
                            </>
                        }
                    />
                    <CountryCompareRow
                        flag="https://flagcdn.com/w40/us.png"
                        name={t.usName}
                        note={t.usNote}
                        sequence={
                            <>
                                <span className="text-slate-500">{t.usMostly} </span>
                                <span className="font-medium text-emerald-500">{t.green}</span>
                                <span className="text-slate-400"> → </span>
                                <span className="font-medium text-amber-400">{t.yellow}</span>
                                <span className="text-slate-400"> → </span>
                                <span className="font-medium text-red-500">{t.redLabel}</span>
                            </>
                        }
                    />
                </div>
            </div>
        </section>
    )
}
