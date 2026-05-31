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
            <div className="flex h-16 items-center px-4 md:px-8 w-full">
                <MainNav lang={lang} />
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center gap-2 md:gap-4 text-sm font-medium text-slate-300">
                        <AdminSessionIndicator />
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </nav>
                </div>
            </div>
        </header>
    )
}
