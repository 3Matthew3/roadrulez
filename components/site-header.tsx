import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

interface SiteHeaderProps {
    lang: string
    labels: {
        nav: {
            map: string
            search: string
            logo_alt: string
        }
        a11y: {
            theme_toggle: string
        }
    }
}

export function SiteHeader({ lang, labels }: SiteHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0e17]/80 backdrop-blur-md">
            <div className="flex h-16 items-center px-4 md:px-8 w-full">
                <MainNav lang={lang} labels={labels.nav} />
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center gap-2 md:gap-4 text-sm font-medium text-slate-300">
                        <ThemeToggle label={labels.a11y.theme_toggle} />
                        <LanguageSwitcher />
                    </nav>
                </div>
            </div>
        </header>
    )
}
