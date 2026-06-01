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
            <div className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:px-8">
                <nav
                    className="flex items-center gap-2 md:gap-3 text-sm font-medium text-slate-300 justify-self-start"
                    aria-label="Site settings"
                >
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <AdminSessionIndicator />
                </nav>
                <MainNav lang={lang} />
                <div className="justify-self-end" aria-hidden="true" />
            </div>
        </header>
    )
}
