import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface MainNavProps {
    items?: {
        title: string
        href: string
        disabled?: boolean
    }[]
    children?: React.ReactNode
    lang: string
    navLabels: {
        countries: string
    }
}

export function MainNav({ items, children, lang, navLabels }: MainNavProps) {
    return (
        <div className="flex items-center">
            <Link href={`/${lang}`} className="mr-4 md:mr-6 flex items-center space-x-2">
                {/* Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo.png"
                    alt="RoadRulez Logo"
                    className="h-8 md:h-10 w-auto object-contain"
                />
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-zinc-300">
                <Link
                    href={`/${lang}/countries`}
                    className={cn(
                        "transition-colors hover:text-slate-900 dark:hover:text-white",
                    )}
                >
                    {navLabels.countries}
                </Link>
                {/* <Link
                    href={`/${lang}/rules`}
                    className={cn(
                        "transition-colors hover:text-white",
                    )}
                >
                    All Rules
                </Link> */}
                {/* <Link
                    href={`/${lang}/about`}
                    className={cn(
                        "transition-colors hover:text-white",
                    )}
                >
                    About
                </Link> */}
            </nav>
        </div>
    )
}

