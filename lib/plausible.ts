/**
 * Server-side only. Never import this in client components.
 * All calls use PLAUSIBLE_API_TOKEN from process.env.
 */

const PLAUSIBLE_BASE = "https://plausible.io/api/v2";
const TOKEN = process.env.PLAUSIBLE_API_TOKEN;
const SITE_ID = process.env.PLAUSIBLE_SITE_ID ?? "roadrulez.com";

async function plausibleFetch(path: string, body: Record<string, unknown>) {
    if (!TOKEN) {
        return null; // graceful no-op if token not configured
    }

    const res = await fetch(`${PLAUSIBLE_BASE}${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ site_id: SITE_ID, ...body }),
        cache: "no-store",
    });

    if (!res.ok) {
        console.error("Plausible API error:", res.status, await res.text());
        return null;
    }

    return res.json();
}

export async function getAggregateStats(period: "7d" | "30d") {
    return plausibleFetch("/query", {
        metrics: ["visitors", "visits", "pageviews", "bounce_rate", "visit_duration"],
        date_range: period,
    });
}

export async function getTimeSeries(period: "30d") {
    return plausibleFetch("/query", {
        metrics: ["visitors", "pageviews"],
        date_range: period,
        dimensions: ["time:day"],
    });
}

export async function getTopPages(period: "30d", limit = 10) {
    return plausibleFetch("/query", {
        metrics: ["visitors", "pageviews"],
        date_range: period,
        dimensions: ["event:page"],
        order_by: [["pageviews", "desc"]],
        pagination: { limit },
    });
}

export async function getTopReferrers(period: "30d", limit = 10) {
    return plausibleFetch("/query", {
        metrics: ["visitors"],
        date_range: period,
        dimensions: ["visit:referrer"],
        order_by: [["visitors", "desc"]],
        pagination: { limit },
    });
}

export async function getTopCountries(period: "30d", limit = 10) {
    return plausibleFetch("/query", {
        metrics: ["visitors"],
        date_range: period,
        dimensions: ["visit:country"],
        order_by: [["visitors", "desc"]],
        pagination: { limit },
    });
}

export async function getCountryViews(period: "30d", limit = 10) {
    // country_view is a custom event with country_code prop
    return plausibleFetch("/query", {
        metrics: ["events"],
        date_range: period,
        dimensions: ["event:props:country_code"],
        filters: [["is", "event:name", ["country_view"]]],
        order_by: [["events", "desc"]],
        pagination: { limit },
    });
}
