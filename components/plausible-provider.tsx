"use client"

/**
 * Initialises the @plausible-analytics/tracker once when the public site mounts.
 * Auto-captures pageviews on every Next.js route navigation.
 * Never runs on /admin routes.
 */

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const SITE_ID = process.env.NEXT_PUBLIC_PLAUSIBLE_SITE_ID ?? "roadrulez.com"

let plausibleInitialized = false;

export function PlausibleProvider() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        let tracker: typeof import("@plausible-analytics/tracker") | null = null

        import("@plausible-analytics/tracker").then((mod) => {
            tracker = mod
            if (!plausibleInitialized) {
                mod.init({
                    domain: SITE_ID,
                    autoCapturePageviews: false, // we fire manually so we control timing
                    outboundLinks: true,
                    captureOnLocalhost: false,
                })
                plausibleInitialized = true;
            }
        })

        return () => {
            // cleanup not needed — singleton tracker
        }
    }, []) // run once on mount

    // Fire a pageview on every navigation
    useEffect(() => {
        if (typeof window === "undefined") return
        import("@plausible-analytics/tracker").then((mod) => {
            mod.track("pageview", {})
        })
    }, [pathname, searchParams])

    return null
}
