"use client"

import { useState, useEffect } from "react"
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, Eye, Globe, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

type KPI = {
    visitors: { value: number }
    pageviews: { value: number }
    visits: { value: number }
    bounce_rate: { value: number }
}

function StatCard({
    title,
    value7d,
    value30d,
    icon: Icon,
}: {
    title: string
    value7d: number | null
    value30d: number | null
    icon: React.FC<any>
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {value30d === null ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <>
                        <div className="text-3xl font-bold">{(value30d ?? 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            7d: {(value7d ?? 0).toLocaleString()}
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [noToken, setNoToken] = useState(false)

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then((r) => {
                if (r.status === 401) { setNoToken(true); setLoading(false); return null }
                return r.json()
            })
            .then((d) => {
                if (d) setData(d)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (noToken) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <Card>
                    <CardContent className="py-16 text-center space-y-2">
                        <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Unauthorized. Only admins can view analytics.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const kpi7d: KPI | null = data?.kpis?.["7d"]?.results?.[0] ?? null
    const kpi30d: KPI | null = data?.kpis?.["30d"]?.results?.[0] ?? null

    // Format time series for recharts
    const timeSeries = (data?.timeSeries?.results ?? []).map((r: any) => ({
        date: r.dimensions?.[0] ? format(new Date(r.dimensions[0]), "dd MMM") : "",
        visitors: r.metrics?.[0] ?? 0,
        pageviews: r.metrics?.[1] ?? 0,
    }))

    const topPages = data?.topPages?.results?.slice(0, 10) ?? []
    const topReferrers = data?.topReferrers?.results?.slice(0, 10) ?? []
    const geoData = data?.geoData?.results?.slice(0, 10) ?? []
    const countryViews = data?.countryViews?.results?.slice(0, 10) ?? []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Powered by Plausible — last 30 days</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Unique Visitors"
                    value7d={kpi7d?.visitors?.value ?? null}
                    value30d={kpi30d?.visitors?.value ?? null}
                    icon={Users}
                />
                <StatCard
                    title="Page Views"
                    value7d={kpi7d?.pageviews?.value ?? null}
                    value30d={kpi30d?.pageviews?.value ?? null}
                    icon={Eye}
                />
                <StatCard
                    title="Visits"
                    value7d={kpi7d?.visits?.value ?? null}
                    value30d={kpi30d?.visits?.value ?? null}
                    icon={Globe}
                />
                <StatCard
                    title="Bounce Rate"
                    value7d={kpi7d?.bounce_rate?.value ? Math.round(kpi7d.bounce_rate.value) : null}
                    value30d={kpi30d?.bounce_rate?.value ? Math.round(kpi30d.bounce_rate.value) : null}
                    icon={TrendingUp}
                />
            </div>

            {/* Views Over Time */}
            <Card>
                <CardHeader>
                    <CardTitle>Views Over Time</CardTitle>
                    <CardDescription>Pageviews and unique visitors — last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-48 w-full" />
                    ) : timeSeries.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "6px",
                                    }}
                                />
                                <Line type="monotone" dataKey="pageviews" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Pageviews" />
                                <Line type="monotone" dataKey="visitors" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} name="Visitors" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-muted-foreground py-8 text-sm">
                            No time series data. Configure PLAUSIBLE_API_TOKEN and PLAUSIBLE_SITE_ID in .env.local
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Country Pages */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Country Views</CardTitle>
                        <CardDescription>country_view events by country_code</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-32 w-full" />
                        ) : countryViews.length > 0 ? (
                            <div className="space-y-2">
                                {countryViews.map((r: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground w-5">{i + 1}.</span>
                                            <Badge variant="outline">{r.dimensions?.[0] ?? "—"}</Badge>
                                        </div>
                                        <span className="font-medium">{(r.metrics?.[0] ?? 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Visitor Geography */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visitor Geography</CardTitle>
                        <CardDescription>Unique visitors by country</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-32 w-full" />
                        ) : geoData.length > 0 ? (
                            <div className="space-y-2">
                                {geoData.map((r: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground w-5">{i + 1}.</span>
                                            <span>{r.dimensions?.[0] ?? "—"}</span>
                                        </div>
                                        <span className="font-medium">{(r.metrics?.[0] ?? 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Pages */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
                        <CardDescription>Pages by pageviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-32 w-full" />
                        ) : topPages.length > 0 ? (
                            <div className="space-y-2">
                                {topPages.map((r: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm gap-2">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                                            <span className="truncate text-xs">{r.dimensions?.[0] ?? "—"}</span>
                                        </div>
                                        <span className="font-medium shrink-0">{(r.metrics?.[1] ?? 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Referrers */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Referrers</CardTitle>
                        <CardDescription>Traffic sources by visitors</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-32 w-full" />
                        ) : topReferrers.length > 0 ? (
                            <div className="space-y-2">
                                {topReferrers.map((r: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm gap-2">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                                            <span className="truncate text-xs">{r.dimensions?.[0] ?? "Direct"}</span>
                                        </div>
                                        <span className="font-medium shrink-0">{(r.metrics?.[0] ?? 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
