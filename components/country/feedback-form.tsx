"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FeedbackFormProps {
    labels: any
    countryName: string
}

const fieldClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:placeholder:text-slate-500 dark:focus:border-[#3B82F6]"

export default function FeedbackForm({ labels, countryName }: FeedbackFormProps) {
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("submitting")
        setTimeout(() => {
            setStatus("success")
        }, 1000)
    }

    if (status === "success") {
        return (
            <div className="mx-auto max-w-[1200px] rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm dark:border-green-500/20 dark:bg-green-500/10">
                <p className="font-medium text-green-700 dark:text-green-400">
                    Thank you! Your feedback has been recorded.
                </p>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "mx-auto max-w-[1200px] rounded-2xl border border-slate-200 bg-white p-8 shadow-md md:p-10",
                "dark:border-slate-700 dark:bg-[#1E293B] dark:shadow-lg dark:shadow-black/20"
            )}
        >
            <h3 className="mb-8 text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {labels.feedback_title}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {labels.feedback_type}
                        </label>
                        <select className={cn(fieldClass, "h-11")}>
                            <option value="incorrect">{labels.issue_types.incorrect}</option>
                            <option value="outdated">{labels.issue_types.outdated}</option>
                            <option value="missing">{labels.issue_types.missing}</option>
                            <option value="other">{labels.issue_types.other}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {labels.feedback_email}
                        </label>
                        <input type="email" className={cn(fieldClass, "h-11")} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {labels.feedback_message}
                    </label>
                    <textarea required className={cn(fieldClass, "min-h-[120px] py-3")} />
                </div>
                <div className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        disabled={status === "submitting"}
                        className="bg-[#2563EB] text-white hover:bg-[#3B82F6]"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {status === "submitting" ? "..." : labels.feedback_submit}
                    </Button>
                </div>
            </form>
        </div>
    )
}
