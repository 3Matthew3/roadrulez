"use client"

/**
 * Fires a `country_view` custom event to Plausible when a country page is visited.
 * This feeds the "Top Country Views" widget in the admin analytics dashboard.
 *
 * Usage:
 *   import { useCountryView } from "@/hooks/use-country-view"
 *   useCountryView("DE")
 */

import { useEffect } from "react"

export function useCountryView(iso2: string) {
    useEffect(() => {
        if (!iso2) return
        import("@plausible-analytics/tracker").then((mod) => {
            mod.track("country_view", {
                props: { country_code: iso2.toUpperCase() },
            })
        })
    }, [iso2])
}
