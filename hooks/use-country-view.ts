"use client"

/**
 * Fires a `country_view` custom event to Plausible when a country page is visited.
 * This feeds the "Top Country Views" widget in the admin analytics dashboard.
 */

import { useEffect } from "react"
import { trackPlausible } from "@/lib/plausible-client"

export function useCountryView(iso2: string) {
    useEffect(() => {
        if (!iso2) return
        trackPlausible("country_view", {
            props: { country_code: iso2.toUpperCase() },
        }).catch(() => {
            // Ignore analytics failures
        })
    }, [iso2])
}
