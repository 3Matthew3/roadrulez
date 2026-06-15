import Link from "next/link"
import { cn } from "@/lib/utils"
import { getCountryTheme } from "@/lib/country-theme"

export type CountrySubnavTab = "overview" | "fines" | "faq" | "sources"

interface CountrySubnavProps {
    lang: string
    countryIso2: string
    active: CountrySubnavTab
    labels: Record<string, string>
    hasFaq?: boolean
    hasFines?: boolean
    accentColor?: string
}

export default function CountrySubnav({
    lang,
    countryIso2,
    active,
    labels,
    hasFaq = true,
    hasFines = true,
    accentColor,
}: CountrySubnavProps) {
    const theme = accentColor ? { accent: accentColor } : getCountryTheme(countryIso2)
    const accent = theme.accent
    const base = `/${lang}/country/${countryIso2.toLowerCase()}`

    const tabs: { id: CountrySubnavTab; href: string; label: string; show: boolean }[] = [
        { id: "overview", href: base, label: labels.nav_overview, show: true },
        { id: "fines", href: `${base}/fines`, label: labels.nav_fines, show: hasFines },
        { id: "faq", href: `${base}/faq`, label: labels.nav_faq, show: hasFaq },
        { id: "sources", href: `${base}/sources`, label: labels.nav_sources, show: true },
    ]

    return (
        <nav
            aria-label={labels.nav_aria ?? "Country sections"}
            className="border-b border-[#E2E8F0] bg-[#F5F7FB]/95 backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1120]/95"
        >
            <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 md:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {tabs
                    .filter((tab) => tab.show)
                    .map((tab) => {
                        const isActive = tab.id === active
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "shrink-0 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "text-[#0F172A] dark:text-white"
                                        : "border-transparent text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A] dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
                                )}
                                style={isActive ? { borderBottomColor: accent } : undefined}
                            >
                                {tab.label}
                            </Link>
                        )
                    })}
            </div>
        </nav>
    )
}
