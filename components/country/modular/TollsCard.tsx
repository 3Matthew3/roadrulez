import { Car } from "lucide-react"
import { TrafficRules } from "@/types/country"

interface TollsCardProps {
    rules: TrafficRules
    dict: any
}

export default function TollsCard({ rules, dict }: TollsCardProps) {
    return (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" /> {dict.rules.tolls}
            </h3>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">{dict.props.required}:</span>
                    <span className={rules.tolls.required ? "text-amber-400 font-medium" : "text-green-400 font-medium"}>
                        {rules.tolls.required ? dict.common.yes : dict.common.no}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-400">{dict.props.type}:</span>
                    <span className="capitalize">{rules.tolls.type}</span>
                </div>
                {rules.tolls.notes && (
                    <p className="text-sm text-slate-500 mt-2 bg-slate-800/50 p-2 rounded">
                        {dict.props.tip}: {rules.tolls.notes}
                    </p>
                )}
            </div>
        </div>
    )
}
