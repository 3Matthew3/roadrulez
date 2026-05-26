import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface MainNavProps {
    items?: {
        title: string
        href: string
        disabled?: boolean
    }[]
    children?: React.ReactNode
    lang: string
    labels: {
        map: string
        search: string
        logo_alt: string
    }
}

export function MainNav({ lang, labels }: MainNavProps) {
    return (
        <div className="mr-4 hidden md:flex">
            <Link href={`/${lang}`} className="mr-6 flex items-center space-x-2">
                {/* Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo.png"
                    alt={labels.logo_alt}
                    className="h-8 md:h-10 w-auto object-contain"
                />
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-300">
                <Link
                    href={`/${lang}/map`}
                    className={cn(
                        "transition-colors hover:text-white",
                    )}
                >
                    {labels.map}
                </Link>
                <Link
                    href={`/${lang}/search`}
                    className={cn(
                        "transition-colors hover:text-white",
                    )}
                >
                    {labels.search}
                </Link>
            </nav>
        </div>
    )
}
