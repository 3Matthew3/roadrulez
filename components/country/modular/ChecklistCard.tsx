import { Square } from "lucide-react"
import { CountryData, TrafficRules } from "@/types/country"

interface ChecklistCardProps {
    data: CountryData
    rules: TrafficRules
    dict: any
}

export default function ChecklistCard({ data, rules, dict }: ChecklistCardProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">{dict.rules.checklist}</h3>
            <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6">
                <h4 className="font-medium text-white mb-4">{dict.rules.mandatory_equipment}</h4>
                {rules.mandatory_equipment.length > 0 ? (
                    <ul className="space-y-3">
                        {rules.mandatory_equipment.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                <Square className="h-5 w-5 text-slate-600" />
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-sm">{dict.country.no_specific_equipment}</p>
                )}
            </div>

            <div className="rounded-xl border border-slate-800 p-6">
                <h4 className="font-medium text-white mb-2">{dict.rules.sources}</h4>
                <ul className="space-y-1 text-sm text-slate-500">
                    {data.sources.length > 0 ? data.sources.map((s, i) => (
                        <li key={i}>{s}</li>
                    )) : (
                        <li>{dict.country.official_highway_code}</li>
                    )}
                </ul>
            </div>
        </div>
    )
}
