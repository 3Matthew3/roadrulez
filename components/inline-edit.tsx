"use client"

import { KeyboardEvent, ReactNode, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
    COUNTRY_INLINE_EDIT_FIELDS,
    CountryInlineEditField,
    CountryInlineEditValue,
    validateCountryInlineEditValue,
} from "@/lib/inline-edit/country-fields"

type InlineEditProps = {
    countryCode: string
    field: CountryInlineEditField
    value: CountryInlineEditValue
    className?: string
    editorClassName?: string
    renderValue?: (value: CountryInlineEditValue) => ReactNode
}

function valueToDraft(value: CountryInlineEditValue): string {
    return Array.isArray(value) ? value.join("\n") : String(value ?? "")
}

function draftToValue(draft: string, input: string): unknown {
    if (input === "list") {
        return draft
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
    }

    if (input === "number") {
        return draft
    }

    return draft
}

export function InlineEdit({
    countryCode,
    field,
    value,
    className,
    editorClassName,
    renderValue,
}: InlineEditProps) {
    const router = useRouter()
    const config = COUNTRY_INLINE_EDIT_FIELDS[field]
    const [currentValue, setCurrentValue] = useState<CountryInlineEditValue>(value)
    const [draft, setDraft] = useState(valueToDraft(value))
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [, startTransition] = useTransition()

    useEffect(() => {
        setCurrentValue(value)
        setDraft(valueToDraft(value))
    }, [value])

    useEffect(() => {
        if (!feedback || feedback.type !== "success") return

        const timeout = window.setTimeout(() => setFeedback(null), 2200)
        return () => window.clearTimeout(timeout)
    }, [feedback])

    const beginEditing = () => {
        setDraft(valueToDraft(currentValue))
        setFeedback(null)
        setIsEditing(true)
    }

    const cancelEditing = () => {
        setDraft(valueToDraft(currentValue))
        setFeedback(null)
        setIsEditing(false)
    }

    const save = async () => {
        const parsedValue = validateCountryInlineEditValue(field, draftToValue(draft, config.input))

        if (!parsedValue.success) {
            setFeedback({ type: "error", message: parsedValue.error })
            return
        }

        setIsSaving(true)
        setFeedback(null)

        try {
            const response = await fetch(`/api/admin/countries/${encodeURIComponent(countryCode)}/inline-edit`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, value: parsedValue.value }),
            })
            const body = await response.json().catch(() => ({}))

            if (!response.ok) {
                setFeedback({ type: "error", message: body.error ?? "Could not save this field." })
                return
            }

            setCurrentValue(body.value ?? parsedValue.value)
            setDraft(valueToDraft(body.value ?? parsedValue.value))
            setIsEditing(false)
            setFeedback({ type: "success", message: body.changed ? "Saved" : "No changes" })
            startTransition(() => router.refresh())
        } catch {
            setFeedback({ type: "error", message: "Could not save this field." })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDisplayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            beginEditing()
        }
    }

    if (isEditing) {
        return (
            <div className={cn("rounded-md border border-blue-500/40 bg-slate-950/80 p-2 shadow-lg", editorClassName)}>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-blue-200">
                    {config.label}
                </label>
                {config.input === "textarea" || config.input === "list" ? (
                    <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={config.input === "list" ? 4 : 3}
                        disabled={isSaving}
                        className="border-slate-700 bg-slate-950 text-slate-100"
                    />
                ) : (
                    <Input
                        type={config.input === "number" ? "number" : "text"}
                        step={config.input === "number" ? "any" : undefined}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        disabled={isSaving}
                        className="border-slate-700 bg-slate-950 text-slate-100"
                    />
                )}
                {config.input === "list" && (
                    <p className="mt-1 text-xs text-slate-500">One item per line.</p>
                )}
                {feedback?.type === "error" && (
                    <p className="mt-2 text-xs text-red-300">{feedback.message}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" onClick={save} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                        Save
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={cancelEditing} disabled={isSaving}>
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Cancel
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("group/inline-edit relative rounded-md transition-colors hover:bg-blue-500/5", className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label={`Edit ${config.label}`}
                onClick={beginEditing}
                onKeyDown={handleDisplayKeyDown}
                className="cursor-text rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
                {renderValue ? renderValue(currentValue) : String(currentValue)}
            </div>
            <button
                type="button"
                onClick={beginEditing}
                className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-blue-400/40 bg-slate-950 text-blue-200 opacity-0 shadow transition-opacity hover:bg-blue-500 hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-400 group-hover/inline-edit:opacity-100"
                aria-label={`Edit ${config.label}`}
            >
                <Pencil className="h-3 w-3" />
            </button>
            {feedback && (
                <p className={cn("mt-1 text-xs", feedback.type === "success" ? "text-green-300" : "text-red-300")}>
                    {feedback.message}
                </p>
            )}
        </div>
    )
}
