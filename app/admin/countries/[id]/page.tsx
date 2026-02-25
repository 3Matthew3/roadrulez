"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import {
    ArrowLeft, Save, Send, CheckCircle2, AlertTriangle,
    Clock, Globe, FileText, MapPin, Link2, History, Loader2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

const overviewSchema = z.object({
    name: z.string().min(1, "Required"),
    flag: z.string().optional(),
    drivingSide: z.enum(["LEFT", "RIGHT"]),
    summary: z.string().optional(),
    status: z.enum(["DRAFT", "VERIFIED", "PUBLISHED"]),
})
type OverviewForm = z.infer<typeof overviewSchema>

const statusColors: Record<string, string> = {
    DRAFT: "secondary",
    VERIFIED: "outline",
    PUBLISHED: "default",
}

const priorityColors: Record<string, string> = {
    CRITICAL: "destructive",
    HIGH: "destructive",
    MEDIUM: "secondary",
    LOW: "outline",
}

export default function CountryDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { toast } = useToast()
    const [country, setCountry] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [publishDialogOpen, setPublishDialogOpen] = useState(false)
    const [publishNote, setPublishNote] = useState("")
    const [publishErrors, setPublishErrors] = useState<string[]>([])

    const form = useForm<OverviewForm>({ resolver: zodResolver(overviewSchema) })

    const fetchCountry = useCallback(async () => {
        setLoading(true)
        const res = await fetch(`/api/admin/countries/${id}`)
        if (!res.ok) { router.push("/admin/countries"); return }
        const data = await res.json()
        setCountry(data)
        form.reset({
            name: data.name,
            flag: data.flag ?? "",
            drivingSide: data.drivingSide,
            summary: data.summary ?? "",
            status: data.status,
        })
        setLoading(false)
    }, [id, router, form])

    useEffect(() => { fetchCountry() }, [fetchCountry])

    const onSave = async (values: OverviewForm) => {
        setSaving(true)
        const res = await fetch(`/api/admin/countries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        })
        setSaving(false)
        if (res.ok) {
            toast({ title: "Saved", description: "Country updated successfully." })
            fetchCountry()
        } else {
            toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" })
        }
    }

    const onPublish = async () => {
        setPublishing(true)
        setPublishErrors([])
        const res = await fetch(`/api/admin/countries/${id}/publish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: publishNote }),
        })
        const data = await res.json()
        setPublishing(false)
        if (res.ok) {
            setPublishDialogOpen(false)
            toast({ title: "Published! 🎉", description: "Country is now live." })
            fetchCountry()
        } else if (res.status === 422) {
            setPublishErrors(data.details ?? [data.error])
        } else {
            toast({ title: "Error", description: data.error, variant: "destructive" })
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!country) return null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/countries"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <span className="text-2xl">{country.flag ?? "🏳"}</span>
                    <div>
                        <h1 className="text-2xl font-bold">{country.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={statusColors[country.status] as any}>{country.status}</Badge>
                            <span className="text-xs text-muted-foreground">{country.iso2}</span>
                            {country.lastVerifiedAt && (
                                <span className="text-xs text-muted-foreground">
                                    Verified {format(new Date(country.lastVerifiedAt), "dd MMM yyyy")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {country.status !== "PUBLISHED" && (
                        <Button onClick={() => setPublishDialogOpen(true)} size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Publish
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview"><Globe className="mr-1.5 h-4 w-4" />Overview</TabsTrigger>
                    <TabsTrigger value="rules"><FileText className="mr-1.5 h-4 w-4" />Rules ({country._count?.rules ?? 0})</TabsTrigger>
                    <TabsTrigger value="regions"><MapPin className="mr-1.5 h-4 w-4" />Regions ({country.regions?.length ?? 0})</TabsTrigger>
                    <TabsTrigger value="sources"><Link2 className="mr-1.5 h-4 w-4" />Sources ({country._count?.sources ?? 0})</TabsTrigger>
                    <TabsTrigger value="changelog"><History className="mr-1.5 h-4 w-4" />Changelog</TabsTrigger>
                </TabsList>

                {/* ── Overview ── */}
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Country Metadata</CardTitle>
                            <CardDescription>Edit the core fields and save.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input {...form.register("name")} />
                                        {form.formState.errors.name && (
                                            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Flag (emoji)</Label>
                                        <Input {...form.register("flag")} placeholder="🇩🇪" />
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Driving Side</Label>
                                        <Select
                                            value={form.watch("drivingSide")}
                                            onValueChange={(v) => form.setValue("drivingSide", v as "LEFT" | "RIGHT")}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="RIGHT">Right-hand traffic</SelectItem>
                                                <SelectItem value="LEFT">Left-hand traffic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                            value={form.watch("status")}
                                            onValueChange={(v) => form.setValue("status", v as any)}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DRAFT">Draft</SelectItem>
                                                <SelectItem value="VERIFIED">Verified</SelectItem>
                                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Summary</Label>
                                    <Textarea {...form.register("summary")} rows={5} placeholder="Brief overview of driving rules..." />
                                </div>
                                <Button type="submit" disabled={saving}>
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Rules ── */}
                <TabsContent value="rules">
                    <div className="space-y-4">
                        {country.rules?.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No rules configured yet.
                                </CardContent>
                            </Card>
                        )}
                        {country.rules?.map((rule: any) => (
                            <Card key={rule.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">{rule.module?.name ?? rule.moduleKey}</CardTitle>
                                            {rule.vehicleType && (
                                                <Badge variant="outline" className="mt-1 text-xs">{rule.vehicleType}</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            Updated {format(new Date(rule.updatedAt), "dd MMM yyyy")}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {rule.structuredValue && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Structured Value</p>
                                            <pre className="rounded bg-muted p-3 text-xs overflow-x-auto">
                                                {JSON.stringify(rule.structuredValue, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    {rule.textNotes && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                                            <p className="text-sm">{rule.textNotes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ── Regions ── */}
                <TabsContent value="regions">
                    <div className="space-y-4">
                        {country.regions?.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No regions configured.
                                </CardContent>
                            </Card>
                        )}
                        {country.regions?.map((region: any) => (
                            <Card key={region.id}>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {region.name}
                                    </CardTitle>
                                </CardHeader>
                                {region.ruleOverrides?.length > 0 && (
                                    <CardContent>
                                        <div className="space-y-3">
                                            {region.ruleOverrides.map((override: any) => (
                                                <div key={override.id} className="rounded border p-3 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium">{override.module?.name ?? override.moduleKey}</p>
                                                        <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                                                            OVERRIDES NATIONAL
                                                        </Badge>
                                                    </div>
                                                    {override.overrideValue && (
                                                        <pre className="text-xs rounded bg-muted p-2 overflow-x-auto">
                                                            {JSON.stringify(override.overrideValue, null, 2)}
                                                        </pre>
                                                    )}
                                                    {override.textNotes && (
                                                        <p className="text-xs text-muted-foreground">{override.textNotes}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ── Sources ── */}
                <TabsContent value="sources">
                    <div className="space-y-3">
                        {country.sources?.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No sources added. Add at least one source before publishing.
                                </CardContent>
                            </Card>
                        )}
                        {country.sources?.map((source: any) => (
                            <Card key={source.id}>
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{source.title}</p>
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline truncate block"
                                            >
                                                {source.url}
                                            </a>
                                            {source.publisher && (
                                                <p className="text-xs text-muted-foreground">
                                                    {source.publisher}
                                                    {source.publishedDate && ` · ${format(new Date(source.publishedDate), "yyyy")}`}
                                                </p>
                                            )}
                                        </div>
                                        {source.moduleKey && (
                                            <Badge variant="outline" className="shrink-0 text-xs">{source.moduleKey}</Badge>
                                        )}
                                    </div>
                                    {source.notes && (
                                        <p className="mt-2 text-xs text-muted-foreground">{source.notes}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ── Changelog ── */}
                <TabsContent value="changelog">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {country.auditLogs?.length === 0 && (
                                    <p className="text-center text-muted-foreground text-sm py-8">No audit history yet.</p>
                                )}
                                {country.auditLogs?.map((log: any, i: number) => (
                                    <div key={log.id}>
                                        {i > 0 && <Separator className="mb-4" />}
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium capitalize">
                                                        {log.action}{" "}
                                                        <span className="text-muted-foreground font-normal">{log.entityType}</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    by {log.actorUser?.name ?? log.actorUser?.email ?? "System"}
                                                </p>
                                                {log.note && (
                                                    <p className="text-sm italic text-muted-foreground">&quot;{log.note}&quot;</p>
                                                )}
                                                {log.afterValue && (
                                                    <details className="mt-1">
                                                        <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                                                            View changes
                                                        </summary>
                                                        <pre className="mt-1 rounded bg-muted p-2 text-xs overflow-x-auto">
                                                            {JSON.stringify(log.afterValue, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Publish Dialog */}
            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Publish {country.name}?</DialogTitle>
                        <DialogDescription>
                            This will make the country publicly visible. The system will check required fields and sources.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {publishErrors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <ul className="list-disc list-inside space-y-1">
                                        {publishErrors.map((e, i) => <li key={i}>{e}</li>)}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label>Publish note (optional)</Label>
                            <Textarea
                                value={publishNote}
                                onChange={(e) => setPublishNote(e.target.value)}
                                placeholder="e.g. Initial publish after ADAC verification"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
                        <Button onClick={onPublish} disabled={publishing}>
                            {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Confirm Publish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
