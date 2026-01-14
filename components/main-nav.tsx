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
}

export function MainNav({ items, children, lang }: MainNavProps) {
    return (
        <div className="mr-4 hidden md:flex">
            <Link href={`/${lang}`} className="mr-6 flex items-center space-x-2">
                {/* Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo.png"
                    alt="RoadRulez Logo"
                    className="h-8 md:h-10 w-auto object-contain"
                />
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-300">
                <Link
                    href={`/${lang}/map`}
                    className={cn(
                        "transition-colors hover:text-white",
                        // pathname === "/docs" ? "text-foreground" : "text-foreground/60"
                    )}
                >
                    Map
                </Link>
                <Link
                    href={`/${lang}/search`}
                    className={cn(
                        "transition-colors hover:text-white",
                    )}
                >
                    Search
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

