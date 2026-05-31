"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Globe, Home, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEFAULT_LOCALE } from "@/lib/constants"

export function AdminTopBar() {
    const pathname = usePathname()
    const isDashboard = pathname === "/admin"
    const isCountriesSection = pathname.startsWith("/admin/countries")

    return (
        <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 border-b border-border bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/${DEFAULT_LOCALE}`}>
                        <Home className="mr-2 h-4 w-4" />
                        Back to website
                    </Link>
                </Button>

                {!isDashboard && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Link>
                    </Button>
                )}

                {!isCountriesSection && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/countries">
                            <Globe className="mr-2 h-4 w-4" />
                            Countries
                        </Link>
                    </Button>
                )}

                {isCountriesSection && pathname !== "/admin/countries" && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/countries">
                            <Globe className="mr-2 h-4 w-4" />
                            All countries
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
