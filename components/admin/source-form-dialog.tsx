"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { SOURCE_TYPE_LABELS, TRUST_LEVEL_LABELS } from "@/types/source"

const sourceFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Valid URL required"),
    publisher: z.string().optional(),
    notes: z.string().optional(),
    moduleKey: z.string().optional(),
    sourceType: z.enum([
        "GOVERNMENT",
        "POLICE",
        "MINISTRY",
        "AUTOMOBILE_ASSOCIATION",
        "LEGAL_DATABASE",
        "SECONDARY",
    ]),
    trustLevel: z.enum(["PRIMARY", "TRUSTED_SECONDARY", "UNVERIFIED"]),
    active: z.boolean(),
})

type SourceFormValues = z.infer<typeof sourceFormSchema>

const MODULE_OPTIONS = [
    "speed_limits",
    "alcohol_limit",
    "seatbelt",
    "child_seats",
    "phone_usage",
    "headlights",
    "parking",
    "priority_rules",
    "tolls",
    "mandatory_equipment",
    "emergency_numbers",
]

export type SourceRecord = {
    id: string
    title: string
    url: string
    publisher?: string | null
    notes?: string | null
    moduleKey?: string | null
    sourceType: SourceFormValues["sourceType"]
    trustLevel: SourceFormValues["trustLevel"]
    active: boolean
}

interface SourceFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    countryId: string
    source?: SourceRecord | null
    onSaved: () => void
}

export function SourceFormDialog({
    open,
    onOpenChange,
    countryId,
    source,
    onSaved,
}: SourceFormDialogProps) {
    const { toast } = useToast()
    const isEdit = Boolean(source)

    const form = useForm<SourceFormValues>({
        resolver: zodResolver(sourceFormSchema),
        defaultValues: {
            title: "",
            url: "",
            publisher: "",
            notes: "",
            moduleKey: "",
            sourceType: "SECONDARY",
            trustLevel: "UNVERIFIED",
            active: true,
        },
    })

    useEffect(() => {
        if (!open) return
        form.reset({
            title: source?.title ?? "",
            url: source?.url ?? "",
            publisher: source?.publisher ?? "",
            notes: source?.notes ?? "",
            moduleKey: source?.moduleKey ?? "",
            sourceType: source?.sourceType ?? "SECONDARY",
            trustLevel: source?.trustLevel ?? "UNVERIFIED",
            active: source?.active ?? true,
        })
    }, [open, source, form])

    const onSubmit = async (values: SourceFormValues) => {
        const payload = {
            ...values,
            countryId,
            moduleKey: values.moduleKey || undefined,
            publisher: values.publisher || undefined,
            notes: values.notes || undefined,
        }

        const res = await fetch(isEdit ? `/api/admin/sources/${source!.id}` : "/api/admin/sources", {
            method: isEdit ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (res.ok) {
            toast({
                title: isEdit ? "Source updated" : "Source added",
                description: "Source saved successfully.",
            })
            onOpenChange(false)
            onSaved()
        } else {
            toast({
                title: "Error",
                description: "Could not save source.",
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit source" : "Add source"}</DialogTitle>
                    <DialogDescription>
                        Official references are monitored daily when active.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input {...form.register("title")} placeholder="Official highway code" />
                    </div>
                    <div className="space-y-2">
                        <Label>URL</Label>
                        <Input {...form.register("url")} placeholder="https://..." />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Source type</Label>
                            <Select
                                value={form.watch("sourceType")}
                                onValueChange={(v) => form.setValue("sourceType", v as SourceFormValues["sourceType"])}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Trust level</Label>
                            <Select
                                value={form.watch("trustLevel")}
                                onValueChange={(v) => form.setValue("trustLevel", v as SourceFormValues["trustLevel"])}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TRUST_LEVEL_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Publisher</Label>
                            <Input {...form.register("publisher")} placeholder="Ministry of Transport" />
                        </div>
                        <div className="space-y-2">
                            <Label>Module (optional)</Label>
                            <Select
                                value={form.watch("moduleKey") || "none"}
                                onValueChange={(v) => form.setValue("moduleKey", v === "none" ? "" : v)}
                            >
                                <SelectTrigger><SelectValue placeholder="General" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">General</SelectItem>
                                    {MODULE_OPTIONS.map((moduleKey) => (
                                        <SelectItem key={moduleKey} value={moduleKey}>{moduleKey}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea {...form.register("notes")} rows={3} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                            <Label>Active monitoring</Label>
                            <p className="text-xs text-muted-foreground">Included in daily source checks</p>
                        </div>
                        <Switch
                            checked={form.watch("active")}
                            onCheckedChange={(checked) => form.setValue("active", checked)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "Save source" : "Add source"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function SourceCardActions({
    source,
    onEdit,
    onDelete,
}: {
    source: SourceRecord
    onEdit: (source: SourceRecord) => void
    onDelete: (sourceId: string) => void
}) {
    return (
        <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(source)}>
                <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(source.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    )
}

export function CountrySourcesManager({
    countryId,
    sources,
    onChanged,
    renderSourceCard,
}: {
    countryId: string
    sources: SourceRecord[]
    onChanged: () => void
    renderSourceCard: (source: SourceRecord, actions: React.ReactNode) => React.ReactNode
}) {
    const { toast } = useToast()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingSource, setEditingSource] = useState<SourceRecord | null>(null)

    const openCreate = () => {
        setEditingSource(null)
        setDialogOpen(true)
    }

    const openEdit = (source: SourceRecord) => {
        setEditingSource(source)
        setDialogOpen(true)
    }

    const deleteSource = async (sourceId: string) => {
        if (!confirm("Delete this source?")) return
        const res = await fetch(`/api/admin/sources/${sourceId}`, { method: "DELETE" })
        if (res.ok) {
            toast({ title: "Source deleted" })
            onChanged()
        } else {
            toast({ title: "Error", description: "Could not delete source.", variant: "destructive" })
        }
    }

    return (
        <>
            <div className="flex justify-end mb-3">
                <Button size="sm" onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add source
                </Button>
            </div>

            {sources.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No sources added. Add at least one source before publishing.
                    </CardContent>
                </Card>
            ) : (
                sources.map((source) =>
                    renderSourceCard(
                        source,
                        <SourceCardActions source={source} onEdit={openEdit} onDelete={deleteSource} />
                    )
                )
            )}

            <SourceFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                countryId={countryId}
                source={editingSource}
                onSaved={onChanged}
            />
        </>
    )
}
