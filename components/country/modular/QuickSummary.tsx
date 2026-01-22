import { Info } from "lucide-react"
import { CountryData } from "@/types/country"

interface QuickSummaryProps {
    data: CountryData
    dict: any
}

export default function QuickSummary({ data, dict }: QuickSummaryProps) {
    return (
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Info className="h-32 w-32 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                {dict.common.summary}
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg mb-4">
                {data.summary}
            </p>
            <ul className="space-y-2">
                {data.common_traps.map((trap, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-400">
                        <span className="text-blue-500 mt-1.5">•</span>
                        {trap}
                    </li>
                ))}
            </ul>
        </div>
    )
}
