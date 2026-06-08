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
            <path
                d="M0 30 L160 30"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.15"
            />
            <path
                d="M0 38 L160 38"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.15"
            />
            <rect x="0" y="30" width="160" height="8" fill="currentColor" opacity="0.06" />
            <path
                d="M0 34 L160 34"
                stroke="#DC2626"
                className="dark:stroke-[#F87171]"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                opacity="0.75"
            />
            <path d="M0 30 L160 30" stroke="currentColor" strokeWidth="2" opacity="0.35" />
            <path d="M0 38 L160 38" stroke="currentColor" strokeWidth="2" opacity="0.35" />
            <rect x="52" y="31" width="56" height="6" rx="1" fill="currentColor" opacity="0.12" />
            <path
                d="M68 34 L76 34 M84 34 L92 34"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.2"
            />
            <path
                d="M20 32 L28 36 L20 40 Z"
                fill="currentColor"
                opacity="0.2"
            />
            <path
                d="M132 32 L140 36 L132 40 Z"
                fill="currentColor"
                opacity="0.2"
            />
        </svg>
    )
}
