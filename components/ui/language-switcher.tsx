"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isValidLocale, SUPPORTED_LOCALES, type Locale } from "@/lib/constants"

const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    de: "Deutsch",
    es: "Español",
    ja: "日本語",
}

export function LanguageSwitcher() {
    const router = useRouter()
    const pathname = usePathname()

    const switchLocale = (locale: Locale) => {
        // Pathname usually starts with a supported locale.
        // We need to replace the first segment.
        const segments = pathname.split('/')
        if (segments.length > 1 && isValidLocale(segments[1])) {
            segments[1] = locale
            const newPath = segments.join('/')
            // Set cookie for persistence
            document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
            router.push(newPath)
        } else {
            // Fallback if path doesn't have locale (should be caught by middleware though)
            const newPath = `/${locale}${pathname}`
            document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
            router.push(newPath)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {SUPPORTED_LOCALES.map((locale) => (
                    <DropdownMenuItem key={locale} onClick={() => switchLocale(locale)}>
                        {LOCALE_LABELS[locale]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
