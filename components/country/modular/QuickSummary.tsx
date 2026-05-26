import { Info } from "lucide-react"
import { CountryData, CountryInlineEditContext } from "@/types/country"
import { InlineEdit } from "@/components/inline-edit"

interface QuickSummaryProps {
    data: CountryData
    dict: any
    inlineEdit?: CountryInlineEditContext
}

export default function QuickSummary({ data, dict, inlineEdit }: QuickSummaryProps) {
    const editable = inlineEdit?.enabled ? inlineEdit : null

    return (
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Info className="h-32 w-32 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                {dict.common.summary}
            </h2>
            {editable ? (
                <InlineEdit
                    countryCode={editable.countryCode}
                    field="summary"
                    value={data.summary}
                    className="mb-4"
                    renderValue={(value) => (
                        <p className="text-slate-300 leading-relaxed text-lg">
                            {String(value)}
                        </p>
                    )}
                />
            ) : (
                <p className="text-slate-300 leading-relaxed text-lg mb-4">
                    {data.summary}
                </p>
            )}
            {editable ? (
                <InlineEdit
                    countryCode={editable.countryCode}
                    field="common_traps"
                    value={data.common_traps}
                    renderValue={(value) => (
                        <ul className="space-y-2">
                            {(Array.isArray(value) ? value : []).map((trap, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-400">
                                    <span className="text-blue-500 mt-1.5">•</span>
                                    {trap}
                                </li>
                            ))}
                        </ul>
                    )}
                />
            ) : (
                <ul className="space-y-2">
                    {data.common_traps.map((trap, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-400">
                            <span className="text-blue-500 mt-1.5">•</span>
                            {trap}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
