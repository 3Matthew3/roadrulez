"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const priorityColors: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
    CRITICAL: "destructive",
    HIGH: "destructive",
    MEDIUM: "secondary",
    LOW: "outline",
}

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
    OPEN: "destructive" as any,
    IN_PROGRESS: "secondary",
    RESOLVED: "outline",
    CLOSED: "outline",
}

type Issue = {
    id: string
    category: string
    message: string
    contact: string | null
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    tags: string[]
    createdAt: string
    country: { id: string; name: string; iso2: string; flag: string | null } | null
    region: { id: string; name: string } | null
}

function IssueCard({ issue, onUpdate }: { issue: Issue; onUpdate: () => void }) {
    const { toast } = useToast()
    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(false)

    const updateIssue = async (field: "status" | "priority", value: string) => {
        setLoading(true)
        const res = await fetch("/api/admin/issues", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: issue.id, [field]: value }),
        })
        setLoading(false)
        if (res.ok) {
            toast({ title: "Updated", description: `Issue ${field} changed to ${value}` })
            onUpdate()
        } else {
            toast({ title: "Error", description: "Failed to update issue", variant: "destructive" })
        }
    }

    return (
        <Card className={`border-l-4 ${issue.priority === "CRITICAL" ? "border-l-destructive" : issue.priority === "HIGH" ? "border-l-orange-500" : "border-l-border"}`}>
            <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant={priorityColors[issue.priority]}>{issue.priority}</Badge>
                            <Badge variant={statusColors[issue.status] as any}>{issue.status.replace("_", " ")}</Badge>
                            <span className="text-xs text-muted-foreground capitalize">{issue.category.replace("_", " ")}</span>
                            {issue.country && (
                                <span className="text-xs text-muted-foreground">
                                    {issue.country.flag} {issue.country.name}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{issue.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(issue.createdAt), "dd MMM yyyy HH:mm")}
                            {issue.contact && ` · ${issue.contact}`}
                        </p>
                        {issue.tags && (issue.tags as any[]).length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                                {(issue.tags as any[]).map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {expanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                        <p className="text-sm">{issue.message}</p>
                        <div className="flex gap-3 flex-wrap">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <Select
                                    value={issue.status}
                                    onValueChange={(v) => updateIssue("status", v)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="h-8 w-36 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Open</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                        <SelectItem value="CLOSED">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Priority</p>
                                <Select
                                    value={issue.priority}
                                    onValueChange={(v) => updateIssue("priority", v)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="h-8 w-36 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function IssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("OPEN")
    const [priorityFilter, setPriorityFilter] = useState<string>("")
    const [total, setTotal] = useState(0)

    const fetchIssues = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)
        if (priorityFilter && priorityFilter !== "all") params.set("priority", priorityFilter)
        params.set("limit", "40")

        const res = await fetch(`/api/admin/issues?${params}`)
        const data = await res.json()
        setIssues(data.issues ?? [])
        setTotal(data.pagination?.total ?? 0)
        setLoading(false)
    }, [statusFilter, priorityFilter])

    useEffect(() => { fetchIssues() }, [fetchIssues])

    const criticalCount = issues.filter((i) => i.priority === "CRITICAL").length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Issue Inbox</h1>
                <p className="text-muted-foreground">
                    {total} issues · {criticalCount} critical
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Issue Cards */}
            <div className="space-y-3">
                {loading &&
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}><CardContent className="pt-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))
                }
                {!loading && issues.length === 0 && (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No issues match your filters</p>
                        </CardContent>
                    </Card>
                )}
                {!loading && issues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} onUpdate={fetchIssues} />
                ))}
            </div>
        </div>
    )
}
