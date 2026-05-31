"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"

type AdminSource = {
    id: string
    title: string
    url: string
    publisher: string | null
    sourceType: keyof typeof SOURCE_TYPE_LABELS
    trustLevel: keyof typeof TRUST_LEVEL_LABELS
    active: boolean
    checkStatus: string
    lastCheckedAt: string | null
    lastChangedAt: string | null
    moduleKey: string | null
    country: { id: string; name: string; iso2: string; flag: string | null } | null
    _count: { reviews: number; checks: number }
}

export default function AdminSourcesPage() {
    const [sources, setSources] = useState<AdminSource[]>([])
    const [loading, setLoading] = useState(true)

    const loadSources = useCallback(async () => {
        setLoading(true)
        const res = await fetch("/api/admin/sources")
        const data = await res.json()
        setSources(data.sources ?? [])
        setLoading(false)
    }, [])

    useEffect(() => {
        loadSources()
    }, [loadSources])

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Sources</h1>
                    <p className="text-muted-foreground">
                        Official references used for country rules and monitoring.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadSources}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                    ))}
                </div>
            ) : sources.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No sources yet. Add sources from a country detail page.
                    </CardContent>
                </Card>
            ) : (
                sources.map((source) => (
                    <Card key={source.id}>
                        <CardContent className="pt-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Badge variant={source.active ? "default" : "outline"}>
                                            {source.active ? "Active" : "Inactive"}
                                        </Badge>
                                        <Badge variant="outline">{source.checkStatus}</Badge>
                                        <Badge variant="secondary">{TRUST_LEVEL_LABELS[source.trustLevel]}</Badge>
                                        <Badge variant="outline">{SOURCE_TYPE_LABELS[source.sourceType]}</Badge>
                                        {source.moduleKey && (
                                            <Badge variant="outline" className="text-xs">{source.moduleKey}</Badge>
                                        )}
                                    </div>
                                    <h3 className="font-semibold">{source.title}</h3>
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1 break-all"
                                    >
                                        {source.url}
                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                    </a>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {source.publisher ?? "Unknown publisher"}
                                        {source.lastCheckedAt &&
                                            ` · Checked ${format(new Date(source.lastCheckedAt), "dd MMM yyyy HH:mm")}`}
                                        {source.lastChangedAt &&
                                            ` · Changed ${format(new Date(source.lastChangedAt), "dd MMM yyyy HH:mm")}`}
                                        {` · ${source._count.checks} checks · ${source._count.reviews} reviews`}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {source.country && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/countries/${source.country.id}`}>
                                                {source.country.flag} {source.country.name}
                                            </Link>
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/admin/source-reviews">View reviews</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}
