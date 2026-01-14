import Link from "next/link"

import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

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
                        {/* Map and Search moved to MainNav or handled there to avoid duplication */}
                        {/* <Link href={`/${lang}/search`} className="hover:text-white transition-colors">Search</Link> */}
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </nav>
                </div>
            </div>
        </header>
    )
}
