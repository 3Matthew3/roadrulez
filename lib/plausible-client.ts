"use client"

/**
 * Client-side Plausible tracker singleton.
 * Ensures init() completes before any track() call.
 */

const SITE_ID = process.env.NEXT_PUBLIC_PLAUSIBLE_SITE_ID ?? "roadrulez.com"

type PlausibleModule = typeof import("@plausible-analytics/tracker")

let initPromise: Promise<PlausibleModule> | null = null

export function ensurePlausibleInit(): Promise<PlausibleModule> {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Plausible tracker is client-only"))
    }

    if (!initPromise) {
        initPromise = import("@plausible-analytics/tracker").then((mod) => {
            mod.init({
                domain: SITE_ID,
                autoCapturePageviews: false,
                outboundLinks: true,
                captureOnLocalhost: false,
            })
            return mod
        })
    }

    return initPromise
}

export async function trackPlausible(
    event: string,
    options: Parameters<PlausibleModule["track"]>[1] = {}
) {
    const mod = await ensurePlausibleInit()
    mod.track(event, options)
}
