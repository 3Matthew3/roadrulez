import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { AdminSessionIndicator } from "@/components/admin-session-indicator"

interface SiteHeaderProps {
    lang: string
}

export function SiteHeader({ lang }: SiteHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0e17]/80 backdrop-blur-md">
            <div className="flex h-16 w-full items-center justify-between gap-3 px-4 md:px-8">
                <MainNav lang={lang} />
                <nav
                    className="flex items-center gap-2 md:gap-3 text-sm font-medium text-slate-300 shrink-0"
                    aria-label="Site settings"
                >
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <AdminSessionIndicator />
                </nav>
            </div>
        </header>
    )
}
