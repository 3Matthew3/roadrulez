"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Lightbulb, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"

type LightState = "red" | "yellow" | "green" | "green-blink"

interface StepContent {
    state: LightState
    title: string
    instruction: string
    description: string
    accent: string
    progress: string
}

interface AustriaTrafficLightsCompactProps {
    lang: string
}

const STEP_DURATION_MS = 2400
const GREEN_BLINK_DURATION_MS = 3600

function TrafficLightDisplay({ state }: { state: LightState }) {
    const blinkGreen = state === "green-blink"

    const active = {
        red: { r: true, y: false, g: false },
        yellow: { r: false, y: true, g: false },
        green: { r: false, y: false, g: true },
        "green-blink": { r: false, y: false, g: false },
    }[state]

    return (
        <div className="relative shrink-0">
            <div className="relative flex flex-col gap-3 rounded-[1.35rem] border border-slate-600 bg-gradient-to-b from-slate-800 to-slate-950 px-4 py-5 shadow-inner">
                <span
                    className={cn(
                        "h-8 w-8 rounded-full border border-black/30 transition-all duration-300",
                        active.r
                            ? "bg-red-500 shadow-[0_0_22px_rgba(239,68,68,0.85)]"
                            : "bg-red-950/80"
                    )}
                />
                <span
                    className={cn(
                        "h-8 w-8 rounded-full border border-black/30 transition-all duration-300",
                        active.y
                            ? "bg-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.85)]"
                            : "bg-amber-950/80"
                    )}
                />
                <span
                    className={cn(
                        "h-8 w-8 rounded-full border border-black/30 transition-all duration-300",
                        blinkGreen
                            ? "animate-traffic-green-blink"
                            : active.g
                              ? "bg-emerald-500 shadow-[0_0_22px_rgba(16,185,129,0.85)]"
                              : "bg-emerald-950/80"
                    )}
                />
            </div>
        </div>
    )
}

function getSteps(isGerman: boolean): StepContent[] {
    return [
        {
            state: "red",
            title: isGerman ? "Rotes Licht" : "Red light",
            instruction: isGerman ? "Du musst anhalten." : "You must stop.",
            description: isGerman
                ? "Vor der Haltelinie oder vor der Ampel anhalten."
                : "Stop before the stop line or before the traffic light.",
            accent: "text-red-400",
            progress: "bg-red-500",
        },
        {
            state: "yellow",
            title: isGerman ? "Gelbes Licht" : "Yellow light",
            instruction: isGerman ? "Gleich wird es grün." : "Green light is coming next.",
            description: isGerman
                ? "Noch anhalten — als Nächstes schaltet die Ampel auf Grün."
                : "Stay stopped for now — the light will turn green next.",
            accent: "text-amber-400",
            progress: "bg-amber-400",
        },
        {
            state: "green",
            title: isGerman ? "Grünes Licht" : "Green light",
            instruction: isGerman ? "Du darfst fahren." : "You may go.",
            description: isGerman
                ? "Fahrt frei, sofern die Kreuzung frei ist."
                : "You may proceed if the intersection is clear.",
            accent: "text-emerald-400",
            progress: "bg-emerald-500",
        },
        {
            state: "green-blink",
            title: isGerman ? "Grün blinkt" : "Flashing green",
            instruction: isGerman ? "Bald wird es gelb." : "Yellow light is coming soon.",
            description: isGerman
                ? "Typisch für Österreich: Grün blinkt mehrmals, bevor es gelb wird."
                : "Typical in Austria: green flashes several times before turning yellow.",
            accent: "text-emerald-300",
            progress: "bg-emerald-400",
        },
        {
            state: "yellow",
            title: isGerman ? "Gelbes Licht" : "Yellow light",
            instruction: isGerman ? "Anhalten, wenn möglich." : "Stop if it is safe to do so.",
            description: isGerman
                ? "Nicht mehr losfahren. Anhalten, wenn du sicher bremsen kannst."
                : "Do not start moving. Stop if you can do so safely.",
            accent: "text-amber-400",
            progress: "bg-amber-400",
        },
    ]
}

export default function AustriaTrafficLightsCompact({ lang }: AustriaTrafficLightsCompactProps) {
    const isGerman = lang === "de"
    const steps = getSteps(isGerman)
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

    const t = {
        title: isGerman ? "Ampelregeln in Österreich" : "Traffic Light Rules in Austria",
        play: isGerman ? "Abspielen" : "Play",
        pause: isGerman ? "Pause" : "Pause",
        tip: isGerman
            ? "Tipp: Play drücken, um den österreichischen Ampelzyklus zu sehen."
            : "Tip: Press play to see the Austrian traffic light cycle.",
    }

    return (
        <article className="flex flex-col rounded-2xl border border-slate-700 bg-[#1E293B] p-5 md:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">{t.title}</h2>
                <button
                    type="button"
                    onClick={togglePlay}
                    aria-pressed={playing}
                    className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                        playing
                            ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                            : "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    )}
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
                    <p className="mt-2 text-2xl font-bold leading-snug text-white">{current.instruction}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{current.description}</p>
                </div>
            </div>

            <div className="mt-6 flex gap-2.5 rounded-xl border border-slate-700/80 bg-slate-800/40 px-3 py-2.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" />
                <p className="text-xs leading-relaxed text-slate-400">{t.tip}</p>
            </div>
        </article>
    )
}
