import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth"
import {
    getAggregateStats,
    getTimeSeries,
    getTopPages,
    getTopReferrers,
    getTopCountries,
    getCountryViews,
} from "@/lib/plausible"

export async function GET(request: NextRequest) {
    return withAdminAuth(async () => {
        const { searchParams } = new URL(request.url)
        const period = (searchParams.get("period") ?? "30d") as "7d" | "30d"

        // Token never leaves the server — all plausible calls happen here
        const [stats7d, stats30d, timeSeries, topPages, topReferrers, geoData, countryViews] =
            await Promise.all([
                getAggregateStats("7d"),
                getAggregateStats("30d"),
                getTimeSeries("30d"),
                getTopPages("30d"),
                getTopReferrers("30d"),
                getTopCountries("30d"),
                getCountryViews("30d"),
            ])

        return NextResponse.json({
            kpis: { "7d": stats7d, "30d": stats30d },
            timeSeries,
            topPages,
            topReferrers,
            geoData,
            countryViews,
        })
    })
}
