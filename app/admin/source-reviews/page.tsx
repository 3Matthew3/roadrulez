"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"

type SourceReview = {
    id: string
    status: "OPEN" | "APPROVED" | "REJECTED"
    evidenceSnippet: string | null
    suggestedValue: string | null
    currentValue: string | null
    moduleKey: string | null
    fieldName: string | null
    adminNote: string | null
    createdAt: string
    reviewedAt: string | null
    source: {
        id: string
        title: string
        url: string
        sourceType: keyof typeof SOURCE_TYPE_LABELS
        trustLevel: keyof typeof TRUST_LEVEL_LABELS
        checkStatus: string
        lastCheckedAt: string | null
        country: { id: string; name: string; iso2: string; flag: string | null } | null
    }
    reviewedBy: { name: string | null; email: string } | null
}

function ReviewCard({
    review,
    onUpdate,
}: {
    review: SourceReview
    onUpdate: () => void
}) {
    const { toast } = useToast()
    const [note, setNote] = useState(review.adminNote ?? "")
    const [loading, setLoading] = useState(false)

    const submitAction = async (action: "approve" | "reject") => {
        setLoading(true)
        const res = await fetch(`/api/admin/source-reviews/${review.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, adminNote: note || undefined }),
        })
        setLoading(false)

        if (res.ok) {
            const data = await res.json()
            const applied = data.applyResult?.applied
            toast({
                title: action === "approve" ? "Review approved" : "Review rejected",
                description: action === "approve"
                    ? applied
                        ? "Suggested rule values were applied."
                        : data.applyResult?.reason ?? "Review acknowledged without rule changes."
                    : "The review was rejected.",
            })
            onUpdate()
        } else {
            const data = await res.json().catch(() => ({}))
            toast({
                title: "Error",
                description: data.error ?? "Failed to update review",
                variant: "destructive",
            })
        }
    }

    return (
        <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge>{review.status}</Badge>
                            <Badge variant="outline">{TRUST_LEVEL_LABELS[review.source.trustLevel]}</Badge>
                            <Badge variant="secondary">{SOURCE_TYPE_LABELS[review.source.sourceType]}</Badge>
                            {review.source.country && (
                                <span className="text-xs text-muted-foreground">
                                    {review.source.country.flag} {review.source.country.name}
                                </span>
                            )}
                        </div>
                        <h3 className="font-semibold">{review.source.title}</h3>
                        <a
                            href={review.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                        >
                            {review.source.url}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-xs text-muted-foreground mt-2">
                            Detected {format(new Date(review.createdAt), "dd MMM yyyy HH:mm")}
                            {review.source.lastCheckedAt &&
                                ` · Last checked ${format(new Date(review.source.lastCheckedAt), "dd MMM yyyy HH:mm")}`}
                        </p>
                    </div>
                    {review.source.country && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/countries/${review.source.country.id}`}>Open country</Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Current DB value</p>
                        <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground">
                            {review.currentValue ?? "No mapped value yet."}
                        </pre>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Suggested update</p>
                        <pre className="text-xs whitespace-pre-wrap break-words">
                            {review.suggestedValue ?? "Source content hash changed."}
                        </pre>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3 md:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Evidence snippet</p>
                        <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
                            {review.evidenceSnippet ?? "No snippet captured."}
                        </p>
                    </div>
                </div>

                {review.status === "OPEN" ? (
                    <>
                        <Textarea
                            placeholder="Admin note (optional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button disabled={loading} onClick={() => submitAction("approve")}>
                                Approve & apply
                            </Button>
                            <Button variant="outline" disabled={loading} onClick={() => submitAction("reject")}>
                                Reject
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Approve applies structured suggestions to country rules when available.
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Reviewed {review.reviewedAt ? format(new Date(review.reviewedAt), "dd MMM yyyy HH:mm") : ""}
                        {review.reviewedBy ? ` by ${review.reviewedBy.name ?? review.reviewedBy.email}` : ""}
                        {review.adminNote ? ` — ${review.adminNote}` : ""}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default function SourceReviewsPage() {
    const [reviews, setReviews] = useState<SourceReview[]>([])
    const [filter, setFilter] = useState<"OPEN" | "ALL">("OPEN")
    const [loading, setLoading] = useState(true)

    const loadReviews = useCallback(async () => {
        setLoading(true)
        const res = await fetch(`/api/admin/source-reviews?status=${filter}`)
        const data = await res.json()
        setReviews(data.reviews ?? [])
        setLoading(false)
    }, [filter])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Source Reviews</h1>
                    <p className="text-muted-foreground">
                        Review detected source changes before they affect published data.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === "OPEN" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("OPEN")}
                    >
                        Open
                    </Button>
                    <Button
                        variant={filter === "ALL" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("ALL")}
                    >
                        All
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadReviews}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No source reviews in this view.
                    </CardContent>
                </Card>
            ) : (
                reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} onUpdate={loadReviews} />
                ))
            )}
        </div>
    )
}
