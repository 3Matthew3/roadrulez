import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { requireEditor } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
    Globe,
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp,
    ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

async function getDashboardData() {
    const [
        totalCountries,
        publishedCountries,
        draftCountries,
        openIssues,
        criticalIssues,
        needsVerification,
        recentActivity,
        recentIssues,
    ] = await Promise.all([
        prisma.country.count(),
        prisma.country.count({ where: { status: "PUBLISHED" } }),
        prisma.country.count({ where: { status: "DRAFT" } }),
        prisma.issueReport.count({ where: { status: "OPEN" } }),
        prisma.issueReport.count({ where: { status: "OPEN", priority: "CRITICAL" } }),
        prisma.country.count({
            where: {
                OR: [
                    { status: "DRAFT" },
                    { lastVerifiedAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
                ],
            },
        }),
        prisma.auditLog.findMany({
            take: 8,
            orderBy: { createdAt: "desc" },
            include: { actorUser: { select: { name: true, email: true } } },
        }),
        prisma.issueReport.findMany({
            take: 5,
            where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
            orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
            include: { country: { select: { name: true, iso2: true, flag: true } } },
        }),
    ])

    return {
        totalCountries, publishedCountries, draftCountries,
        openIssues, criticalIssues, needsVerification,
        recentActivity, recentIssues,
    }
}

const priorityColors: Record<string, string> = {
    CRITICAL: "destructive",
    HIGH: "destructive",
    MEDIUM: "secondary",
    LOW: "outline",
}

export default async function AdminDashboard() {
    const session = await requireEditor()
    if (!session) redirect("/admin/login")

    const data = await getDashboardData()

    const statCards = [
        {
            title: "Total Countries",
            value: data.totalCountries,
            sub: `${data.publishedCountries} published`,
            icon: Globe,
            color: "text-blue-400",
        },
        {
            title: "Needs Attention",
            value: data.needsVerification,
            sub: `${data.draftCountries} drafts`,
            icon: Clock,
            color: "text-yellow-400",
        },
        {
            title: "Open Issues",
            value: data.openIssues,
            sub: data.criticalIssues > 0 ? `${data.criticalIssues} critical` : "No critical",
            icon: AlertCircle,
            color: data.criticalIssues > 0 ? "text-red-400" : "text-muted-foreground",
        },
        {
            title: "Published",
            value: data.publishedCountries,
            sub: `${Math.round((data.publishedCountries / Math.max(data.totalCountries, 1)) * 100)}% coverage`,
            icon: CheckCircle2,
            color: "text-green-400",
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {(session.user as any).name ?? session.user?.email}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Recent Activity</CardTitle>
                            <CardDescription>Latest changes across all countries</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.recentActivity.length === 0 && (
                                <p className="text-sm text-muted-foreground">No recent activity</p>
                            )}
                            {data.recentActivity.map((log: (typeof data.recentActivity)[number]) => (
                                <div key={log.id} className="flex items-start gap-3 text-sm">
                                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium capitalize">
                                            {log.action} <span className="text-muted-foreground">{log.entityType}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {log.actorUser?.name ?? log.actorUser?.email ?? "System"} ·{" "}
                                            {format(new Date(log.createdAt), "dd MMM HH:mm")}
                                        </p>
                                        {log.note && (
                                            <p className="text-xs text-muted-foreground italic truncate">{log.note}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Open Issues */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Open Issues</CardTitle>
                            <CardDescription>Highest priority unresolved reports</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/issues">
                                View all <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.recentIssues.length === 0 && (
                                <p className="text-sm text-muted-foreground">No open issues 🎉</p>
                            )}
                            {data.recentIssues.map((issue: (typeof data.recentIssues)[number]) => (
                                <div key={issue.id} className="flex items-start justify-between gap-2 text-sm">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{issue.message.slice(0, 60)}...</p>
                                        <p className="text-xs text-muted-foreground">
                                            {issue.country?.flag} {issue.country?.name ?? "General"} · {issue.category}
                                        </p>
                                    </div>
                                    <Badge variant={priorityColors[issue.priority] as any} className="shrink-0 text-xs">
                                        {issue.priority}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <div className="grid gap-3 sm:grid-cols-3">
                <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/admin/countries">
                        <Globe className="h-5 w-5" />
                        <span>Manage Countries</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/admin/issues">
                        <AlertCircle className="h-5 w-5" />
                        <span>Issue Inbox</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/admin/analytics">
                        <TrendingUp className="h-5 w-5" />
                        <span>Analytics</span>
                    </Link>
                </Button>
            </div>
        </div>
    )
}
