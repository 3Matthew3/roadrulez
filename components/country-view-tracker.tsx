"use client"

import { useCountryView } from "@/hooks/use-country-view"

/**
 * Drop this into the country page (server component) to fire a country_view
 * Plausible event. Renders nothing visible.
 */
export function CountryViewTracker({ iso2 }: { iso2: string }) {
    useCountryView(iso2)
    return null
}
