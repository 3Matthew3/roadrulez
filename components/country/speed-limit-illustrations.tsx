import { cn } from "@/lib/utils"

export type SpeedLimitScene = "urban" | "rural" | "motorway"

interface SpeedLimitIllustrationProps {
    scene: SpeedLimitScene
    className?: string
}

export function SpeedLimitIllustration({ scene, className }: SpeedLimitIllustrationProps) {
    const shared = cn("h-12 w-full text-slate-400 dark:text-slate-500", className)

    if (scene === "urban") {
        return (
            <svg viewBox="0 0 160 48" fill="none" aria-hidden="true" className={shared}>
                <rect x="0" y="42" width="160" height="6" fill="currentColor" opacity="0.12" />
                <rect x="8" y="18" width="18" height="24" rx="1" fill="currentColor" opacity="0.35" />
                <rect x="30" y="10" width="14" height="32" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="48" y="22" width="20" height="20" rx="1" fill="currentColor" opacity="0.3" />
                <rect x="72" y="6" width="16" height="36" rx="1" fill="#DC2626" className="dark:fill-[#F87171]" opacity="0.85" />
                <rect x="92" y="14" width="22" height="28" rx="1" fill="currentColor" opacity="0.4" />
                <rect x="118" y="20" width="14" height="22" rx="1" fill="currentColor" opacity="0.35" />
                <rect x="136" y="12" width="16" height="30" rx="1" fill="currentColor" opacity="0.45" />
                <rect x="12" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.2" />
                <rect x="12" y="30" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.2" />
                <rect x="76" y="14" width="3" height="3" rx="0.5" fill="white" opacity="0.5" />
                <rect x="76" y="22" width="3" height="3" rx="0.5" fill="white" opacity="0.5" />
                <rect x="76" y="30" width="3" height="3" rx="0.5" fill="white" opacity="0.5" />
                <rect x="98" y="20" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.15" />
                <rect x="98" y="28" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.15" />
            </svg>
        )
    }

    if (scene === "rural") {
        return (
            <svg viewBox="0 0 160 48" fill="none" aria-hidden="true" className={shared}>
                <path
                    d="M0 38 Q40 34 80 36 T160 34 L160 48 L0 48 Z"
                    fill="currentColor"
                    opacity="0.1"
                />
                <ellipse cx="24" cy="38" rx="28" ry="8" fill="currentColor" opacity="0.08" />
                <ellipse cx="130" cy="36" rx="32" ry="9" fill="currentColor" opacity="0.08" />
                <path
                    d="M0 36 C30 34 50 38 80 35 C110 32 130 37 160 34"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.25"
                />
                <path
                    d="M20 36 C45 33 65 37 80 35 C95 33 115 37 140 34"
                    stroke="#DC2626"
                    className="dark:stroke-[#F87171]"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.7"
                />
                <path d="M18 36 L14 28 L22 28 Z" fill="currentColor" opacity="0.45" />
                <rect x="13" y="28" width="2" height="8" fill="currentColor" opacity="0.35" />
                <path d="M28 36 L24 24 L32 24 Z" fill="currentColor" opacity="0.35" />
                <rect x="23" y="24" width="2" height="12" fill="currentColor" opacity="0.3" />
                <path d="M132 35 L128 22 L136 22 Z" fill="currentColor" opacity="0.45" />
                <rect x="127" y="22" width="2" height="13" fill="currentColor" opacity="0.35" />
                <path d="M148 35 L144 26 L152 26 Z" fill="currentColor" opacity="0.35" />
                <rect x="143" y="26" width="2" height="9" fill="currentColor" opacity="0.3" />
                <circle cx="80" cy="35" r="2" fill="#DC2626" className="dark:fill-[#F87171]" opacity="0.8" />
            </svg>
        )
    }

    return (
        <svg viewBox="0 0 160 48" fill="none" aria-hidden="true" className={shared}>
            {/* Green verges */}
            <path
                d="M0 48 L52 18 L0 18 Z"
                fill="#86EFAC"
                opacity="0.22"
                className="dark:fill-emerald-600 dark:opacity-15"
            />
            <path
                d="M160 48 L108 18 L160 18 Z"
                fill="#86EFAC"
                opacity="0.22"
                className="dark:fill-emerald-600 dark:opacity-15"
            />

            {/* Road surface in perspective */}
            <path
                d="M24 48 L58 20 L102 20 L136 48 Z"
                fill="currentColor"
                opacity="0.22"
                className="dark:opacity-30"
            />
            <path
                d="M24 48 L58 20 L102 20 L136 48 Z"
                fill="#64748B"
                opacity="0.35"
                className="dark:fill-slate-500 dark:opacity-45"
            />

            {/* Guardrails / road edges */}
            <path
                d="M30 48 L60 22"
                stroke="#F8FAFC"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="dark:stroke-slate-200"
            />
            <path
                d="M130 48 L100 22"
                stroke="#F8FAFC"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="dark:stroke-slate-200"
            />

            {/* Centre line */}
            <path
                d="M80 48 L80 21"
                stroke="#DC2626"
                strokeWidth="1.75"
                strokeDasharray="7 5"
                strokeLinecap="round"
                className="dark:stroke-red-400"
            />

            {/* Overhead gantry — typical motorway cue */}
            <path
                d="M54 20 L106 20"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.45"
                className="dark:opacity-55"
            />
            <path d="M58 20 V14" stroke="currentColor" strokeWidth="2" opacity="0.45" className="dark:opacity-55" />
            <path d="M102 20 V14" stroke="currentColor" strokeWidth="2" opacity="0.45" className="dark:opacity-55" />
            <rect
                x="62"
                y="10"
                width="36"
                height="5"
                rx="1"
                fill="currentColor"
                opacity="0.3"
                className="dark:opacity-40"
            />

            {/* Direction chevrons on the road */}
            <path
                d="M74 38 L80 32 L86 38"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.25"
            />
            <path
                d="M74 42 L80 36 L86 42"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.18"
            />
        </svg>
    )
}

/** Standard EU/DE motorway pictogram (Autobahn symbol) — uses currentColor like Lucide icons. */
export function MotorwayPictogramIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
            <rect x="4" y="4.25" width="16" height="2.75" rx="0.45" />
            <path d="M6.25 19.75 L9.25 8.75 H10.85 L9.85 19.75 Z" />
            <path d="M17.75 19.75 L14.75 8.75 H13.15 L14.15 19.75 Z" />
        </svg>
    )
}
