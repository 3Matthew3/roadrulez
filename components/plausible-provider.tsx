"use client"

/**
 * Initialises the @plausible-analytics/tracker once when the public site mounts.
 * Auto-captures pageviews on every Next.js route navigation.
 * Never runs on /admin routes.
 */

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackPlausible } from "@/lib/plausible-client"

export function PlausibleProvider() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        trackPlausible("pageview", {}).catch(() => {
            // Ignore analytics failures (e.g. ad blockers, localhost)
        })
    }, [pathname, searchParams])

    return null
}
