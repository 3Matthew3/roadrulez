"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeedbackFormProps {
    labels: any // loosely typed for now as we pass the whole dictionary or sub-part
    countryName: string
}

export default function FeedbackForm({ labels, countryName }: FeedbackFormProps) {
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("submitting")
        // Mock submission delay
        setTimeout(() => {
            setStatus("success")
            // In a real app, this would POST to an API
        }, 1000)
    }

    if (status === "success") {
        return (
            <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                <p className="text-green-400 font-medium">Thank you! Your feedback has been recorded.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white mb-6">{labels.feedback_title}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">{labels.feedback_type}</label>
                        <select className="w-full h-10 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option value="incorrect">{labels.issue_types.incorrect}</option>
                            <option value="outdated">{labels.issue_types.outdated}</option>
                            <option value="missing">{labels.issue_types.missing}</option>
                            <option value="other">{labels.issue_types.other}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">{labels.feedback_email}</label>
                        <input
                            type="email"
                            className="w-full h-10 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-slate-400">{labels.feedback_message}</label>
                    <textarea
                        required
                        className="w-full min-h-[100px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={status === "submitting"} className="bg-blue-600 hover:bg-blue-500 text-white">
                        <Send className="w-4 h-4 mr-2" />
                        {status === "submitting" ? "..." : labels.feedback_submit}
                    </Button>
                </div>
            </form>
        </div>
    )
}
