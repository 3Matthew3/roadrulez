"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Lightbulb, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrafficLightVariant } from "@/lib/country-theme"
import { COUNTRY_CARD, COUNTRY_PREMIUM as S } from "@/lib/country-premium-styles"

type LightState = "red" | "yellow" | "green" | "green-blink" | "red-yellow"

interface StepContent {
    state: LightState
    title: string
    instruction: string
    description: string
    accent: string
}

interface CountryTrafficLightsCompactProps {
    lang: string
    countryIso2: string
    variant: TrafficLightVariant
    accentColor?: string
    accentDark?: string
    fill?: string
    fillText?: string
}

const STEP_DURATION_MS = 2400
const GREEN_BLINK_DURATION_MS = 3600

function TrafficLightDisplay({ state }: { state: LightState }) {
    const blinkGreen = state === "green-blink"
    const redOn = state === "red" || state === "red-yellow"
    const yellowOn = state === "yellow" || state === "red-yellow"
    const greenOn = state === "green"

    return (
        <div className="relative shrink-0">
            <div className="relative flex flex-col gap-3 rounded-[1.35rem] border border-slate-400 bg-gradient-to-b from-slate-500 to-slate-700 px-4 py-5 shadow-md shadow-slate-400/30 dark:border-slate-600 dark:from-slate-700 dark:to-slate-900 dark:shadow-inner dark:shadow-black/50">
                <span
                    className={cn(
                        "h-8 w-8 rounded-full border border-black/20 transition-all duration-300 dark:border-black/30",
                        redOn
                            ? "bg-[#EF1A1A] shadow-[0_0_22px_rgba(239,26,26,1),0_0_40px_rgba(200,0,0,0.65)]"
                            : "bg-red-950/50 dark:bg-red-950/80"
                    )}
                />
                <span
                    className={cn(
                        "h-8 w-8 rounded-full border border-black/20 transition-all duration-300 dark:border-black/30",
                        yellowOn
                            ? "bg-[#FFCC00] shadow-[0_0_22px_rgba(255,204,0,1),0_0_40px_rgba(230,180,0,0.7)]"
                            : "bg-yellow-950/50 dark:bg-yellow-950/80"
                    )}
                />
                <span
                    className={cn(
                        "h-8 w-8 rounded-full border border-black/20 transition-all duration-300 dark:border-black/30",
                        blinkGreen
                            ? "animate-traffic-green-blink"
                            : greenOn
                              ? "bg-green-500 shadow-[0_0_22px_rgba(34,197,94,1),0_0_40px_rgba(34,197,94,0.7)]"
                              : "bg-emerald-950/50 dark:bg-emerald-950/80"
                    )}
                />
            </div>
        </div>
    )
}

function getAustriaSteps(isGerman: boolean): StepContent[] {
    return [
        {
            state: "red",
            title: isGerman ? "Rotes Licht" : "Red light",
            instruction: isGerman ? "Du musst anhalten." : "You must stop.",
            description: isGerman
                ? "Vor der Haltelinie oder vor der Ampel anhalten."
                : "Stop before the stop line or before the traffic light.",
            accent: "text-red-400",
        },
        {
            state: "yellow",
            title: isGerman ? "Gelbes Licht" : "Yellow light",
            instruction: isGerman ? "Gleich wird es grün." : "Green light is coming next.",
            description: isGerman
                ? "Noch anhalten — als Nächstes schaltet die Ampel auf Grün."
                : "Stay stopped for now — the light will turn green next.",
            accent: "text-amber-400",
        },
        {
            state: "green",
            title: isGerman ? "Grünes Licht" : "Green light",
            instruction: isGerman ? "Du darfst fahren." : "You may go.",
            description: isGerman
                ? "Fahrt frei, sofern die Kreuzung frei ist."
                : "You may proceed if the intersection is clear.",
            accent: "text-emerald-400",
        },
        {
            state: "green-blink",
            title: isGerman ? "Grün blinkt" : "Flashing green",
            instruction: isGerman ? "Bald wird es gelb." : "Yellow light is coming soon.",
            description: isGerman
                ? "Typisch für Österreich: Grün blinkt mehrmals, bevor es gelb wird."
                : "Typical in Austria: green flashes several times before turning yellow.",
            accent: "text-emerald-300",
        },
        {
            state: "yellow",
            title: isGerman ? "Gelbes Licht" : "Yellow light",
            instruction: isGerman ? "Anhalten, wenn möglich." : "Stop if it is safe to do so.",
            description: isGerman
                ? "Nicht mehr losfahren. Anhalten, wenn du sicher bremsen kannst."
                : "Do not start moving. Stop if you can do so safely.",
            accent: "text-amber-400",
        },
    ]
}

function getGermanySteps(isGerman: boolean, countryEn: string, countryDe: string): StepContent[] {
    const inCountry = isGerman ? `In ${countryDe}` : `In ${countryEn}`
    return [
        {
            state: "red",
            title: isGerman ? "Rotes Licht" : "Red light",
            instruction: isGerman ? "Du musst anhalten." : "You must stop.",
            description: isGerman
                ? `Vor der Haltelinie warten. ${inCountry} folgt als Nächstes Rot+Gelb.`
                : `Wait before the stop line. ${inCountry}, red and yellow come on together next.`,
            accent: "text-red-400",
        },
        {
            state: "red-yellow",
            title: isGerman ? "Rot und Gelb" : "Red and yellow",
            instruction: isGerman ? "Bereit machen — gleich Grün." : "Get ready — green is next.",
            description: isGerman
                ? `${inCountry}: Rot und Gelb leuchten gemeinsam, bevor es grün wird.`
                : `${inCountry}: red and yellow show together before green.`,
            accent: "text-amber-400",
        },
        {
            state: "green",
            title: isGerman ? "Grünes Licht" : "Green light",
            instruction: isGerman ? "Du darfst fahren." : "You may go.",
            description: isGerman
                ? "Fahrt frei, wenn die Kreuzung frei ist."
                : "You may proceed if the intersection is clear.",
            accent: "text-emerald-400",
        },
        {
            state: "yellow",
            title: isGerman ? "Gelbes Licht" : "Yellow light",
            instruction: isGerman ? "Anhalten, wenn möglich." : "Stop if it is safe to do so.",
            description: isGerman
                ? "Ampel schaltet auf Rot. Nicht mehr losfahren."
                : "The light is about to turn red. Do not start moving.",
            accent: "text-amber-400",
        },
    ]
}

function getUsSteps(isGerman: boolean): StepContent[] {
    return [
        {
            state: "red",
            title: isGerman ? "Rotes Licht" : "Red light",
            instruction: isGerman ? "Du musst anhalten." : "You must stop.",
            description: isGerman
                ? "Vollständig an der Haltelinie stoppen. Rechtsabbiegen bei Rot ist oft erlaubt — erst stoppen, dann abbiegen, wenn kein Schild es verbietet."
                : "Come to a complete stop at the stop line. Right on red is often allowed—stop fully first, then turn unless a sign prohibits it.",
            accent: "text-red-400",
        },
        {
            state: "green",
            title: isGerman ? "Grünes Licht" : "Green light",
            instruction: isGerman ? "Du darfst fahren." : "You may go.",
            description: isGerman
                ? "Fahrt frei, wenn die Kreuzung frei ist. Fußgänger und Radfahrer haben Vorrang beim Abbiegen."
                : "You may proceed if the intersection is clear. Yield to pedestrians and cyclists when turning.",
            accent: "text-emerald-400",
        },
        {
            state: "yellow",
            title: isGerman ? "Gelbes Licht" : "Yellow light",
            instruction: isGerman ? "Anhalten, wenn möglich." : "Stop if it is safe to do so.",
            description: isGerman
                ? "Typisch in den USA: Gelb bedeutet Stopp, wenn du sicher bremsen kannst — es gibt keine Rot+Gelb-Phase."
                : "Typical in the US: yellow means stop if you can do so safely—there is no red-and-yellow phase.",
            accent: "text-amber-400",
        },
    ]
}

const COUNTRY_LABELS: Record<string, { en: string; de: string }> = {
    AT: { en: "Austria", de: "Österreich" },
    DE: { en: "Germany", de: "Deutschland" },
    IT: { en: "Italy", de: "Italien" },
    GB: { en: "the United Kingdom", de: "dem Vereinigten Königreich" },
    US: { en: "the United States", de: "den USA" },
}

export default function CountryTrafficLightsCompact({
    lang,
    countryIso2,
    variant,
    accentColor = "#F87171",
    accentDark = "#DC2626",
    fill,
    fillText = "#FFFFFF",
}: CountryTrafficLightsCompactProps) {
    const isGerman = lang === "de"
    const iso = countryIso2.toUpperCase()
    const labels = COUNTRY_LABELS[iso] ?? { en: "this country", de: "diesem Land" }
    const steps =
        variant === "us"
            ? getUsSteps(isGerman)
            : variant === "de"
              ? getGermanySteps(isGerman, labels.en, labels.de)
              : getAustriaSteps(isGerman)
    const [stepIndex, setStepIndex] = useState(0)
    const [playing, setPlaying] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const current = steps[stepIndex]

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    useEffect(() => {
        if (!playing) {
            clearTimer()
            return
        }

        const delay =
            steps[stepIndex].state === "green-blink" ? GREEN_BLINK_DURATION_MS : STEP_DURATION_MS

        timerRef.current = setTimeout(() => {
            if (stepIndex >= steps.length - 1) {
                setStepIndex(0)
                setPlaying(false)
                return
            }
            setStepIndex((index) => index + 1)
        }, delay)

        return clearTimer
    }, [playing, stepIndex, steps, clearTimer])

    const togglePlay = () => {
        if (playing) {
            setPlaying(false)
            return
        }
        if (stepIndex !== 0) {
            setStepIndex(0)
        }
        setPlaying(true)
    }

    const countryName = isGerman ? labels.de : labels.en

    const t = {
        title: isGerman
            ? `Ampelregeln in ${countryName}`
            : `Traffic Light Rules in ${countryName}`,
        play: isGerman ? "Abspielen" : "Play",
        pause: isGerman ? "Pause" : "Pause",
        tip:
            variant === "us"
                ? isGerman
                    ? "Tipp: Play drücken, um den US-Ampelzyklus (Rot → Grün → Gelb) zu sehen."
                    : "Tip: Press play to see the US cycle (red → green → yellow)."
                : variant === "de"
                  ? isGerman
                      ? "Tipp: Play drücken, um den EU-Ampelzyklus (Rot → Rot+Gelb → Grün → Gelb) zu sehen."
                      : "Tip: Press play to see the EU cycle (red → red+yellow → green → yellow)."
                  : isGerman
                    ? "Tipp: Play drücken, um den österreichischen Ampelzyklus zu sehen."
                    : "Tip: Press play to see the Austrian traffic light cycle.",
    }

    return (
        <article className={cn(COUNTRY_CARD, "flex flex-col p-5 md:p-6")}>
            <div className="mb-5 flex items-start justify-between gap-3">
                <h2 className={cn("text-lg font-semibold", S.heading)}>{t.title}</h2>
                <button
                    type="button"
                    onClick={togglePlay}
                    aria-pressed={playing}
                    className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                        playing
                            ? "border-[#CBD5E1] bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            : "hover:opacity-90"
                    )}
                    style={
                        playing
                            ? undefined
                            : variant === "de" && fill
                              ? {
                                    borderColor: fill,
                                    backgroundColor: fill,
                                    color: fillText,
                                }
                              : variant === "us" && fill
                                ? {
                                      borderColor: fill,
                                      backgroundColor: fill,
                                      color: fillText,
                                  }
                                : {
                                    borderColor: `${accentDark}66`,
                                    backgroundColor: `${accentDark}1A`,
                                    color: accentColor,
                                }
                    }
                >
                    {playing ? (
                        <>
                            <Pause className="h-4 w-4" />
                            {t.pause}
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4" />
                            {t.play}
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:items-start">
                <TrafficLightDisplay state={current.state} />

                <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-semibold", current.accent)}>{current.title}</p>
                    <p className="mt-2 text-2xl font-bold leading-snug text-[#0F172A] dark:text-white">{current.instruction}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#475569] dark:text-slate-400">{current.description}</p>
                </div>
            </div>

            <div className="mt-6 flex gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 dark:border-slate-700/80 dark:bg-slate-800/40">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/80 dark:text-amber-300/80" />
                <p className="text-xs leading-relaxed text-[#64748B] dark:text-slate-400">{t.tip}</p>
            </div>
        </article>
    )
}
