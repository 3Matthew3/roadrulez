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

export function LanguageSwitcher() {
    const router = useRouter()
    const pathname = usePathname()

    const switchLocale = (locale: string) => {
        // Pathname usually starts with /en or /de. 
        // We need to replace the first segment.
        const segments = pathname.split('/')
        if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'de')) {
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
                <DropdownMenuItem onClick={() => switchLocale("en")}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale("de")}>
                    Deutsch
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
