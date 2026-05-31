"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const createCountrySchema = z.object({
    name: z.string().min(1, "Name is required"),
    iso2: z
        .string()
        .length(2, "ISO2 must be exactly 2 letters")
        .regex(/^[A-Za-z]{2}$/, "ISO2 must be two letters"),
    flag: z.string().optional(),
    drivingSide: z.enum(["LEFT", "RIGHT"]),
    summary: z.string().optional(),
})

type CreateCountryForm = z.infer<typeof createCountrySchema>

export default function NewCountryPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<CreateCountryForm>({
        resolver: zodResolver(createCountrySchema),
        defaultValues: {
            name: "",
            iso2: "",
            flag: "",
            drivingSide: "RIGHT",
            summary: "",
        },
    })

    const onSubmit = async (values: CreateCountryForm) => {
        setSubmitting(true)
        const res = await fetch("/api/admin/countries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...values,
                iso2: values.iso2.toUpperCase(),
                flag: values.flag || undefined,
                summary: values.summary || undefined,
            }),
        })
        setSubmitting(false)

        if (res.ok) {
            const country = await res.json()
            toast({ title: "Country created", description: `${country.name} was added as a draft.` })
            router.push(`/admin/countries/${country.id}`)
            router.refresh()
            return
        }

        const data = await res.json().catch(() => ({}))
        const message =
            data.error?.fieldErrors?.iso2?.[0] ??
            data.error?.formErrors?.[0] ??
            (typeof data.error === "string" ? data.error : "Could not create country.")
        toast({ title: "Error", description: message, variant: "destructive" })
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/countries">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add Country</h1>
                    <p className="text-muted-foreground">Creates a new draft country in the database.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Country details</CardTitle>
                    <CardDescription>
                        ISO2 must be unique (e.g. PT for Portugal). You can add rules and sources after saving.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Portugal" {...form.register("name")} />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="iso2">ISO2 code</Label>
                                <Input
                                    id="iso2"
                                    placeholder="PT"
                                    maxLength={2}
                                    className="uppercase"
                                    {...form.register("iso2", {
                                        onChange: (e) => {
                                            e.target.value = e.target.value.toUpperCase()
                                        },
                                    })}
                                />
                                {form.formState.errors.iso2 && (
                                    <p className="text-xs text-destructive">{form.formState.errors.iso2.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="flag">Flag (emoji)</Label>
                                <Input id="flag" placeholder="🇵🇹" {...form.register("flag")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Driving side</Label>
                                <Select
                                    value={form.watch("drivingSide")}
                                    onValueChange={(v) => form.setValue("drivingSide", v as "LEFT" | "RIGHT")}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RIGHT">Right-hand traffic</SelectItem>
                                        <SelectItem value="LEFT">Left-hand traffic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="summary">Summary (optional)</Label>
                            <Textarea
                                id="summary"
                                rows={4}
                                placeholder="Brief overview of driving rules..."
                                {...form.register("summary")}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                Create country
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/countries">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
