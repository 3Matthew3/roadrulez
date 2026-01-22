import { ThermometerSnowflake } from "lucide-react"
import { TrafficRules } from "@/types/country"

interface AlcoholLimitCardProps {
    rules: TrafficRules
    dict: any
}

export default function AlcoholLimitCard({ rules, dict }: AlcoholLimitCardProps) {
    return (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <ThermometerSnowflake className="h-5 w-5" /> {dict.rules.alcohol_limit}
            </h3>
            <div className="mb-4">
                <div className="text-3xl font-bold text-white mb-1">
                    {rules.alcohol_limit.value} <span className="text-base font-normal text-slate-400">{rules.alcohol_limit.unit}</span>
                </div>
            </div>
            {rules.alcohol_limit.notes && (
                <p className="text-sm text-slate-400">
                    {rules.alcohol_limit.notes}
                </p>
            )}
        </div>
    )
}
