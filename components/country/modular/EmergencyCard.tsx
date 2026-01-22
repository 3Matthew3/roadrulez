import { Siren } from "lucide-react"
import { TrafficRules } from "@/types/country"

interface EmergencyCardProps {
    rules: TrafficRules
    dict: any
}

export default function EmergencyCard({ rules, dict }: EmergencyCardProps) {
    return (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <Siren className="h-5 w-5" /> {dict.rules.emergency}
            </h3>
            <ul className="space-y-3">
                {rules.emergency_numbers.map((num, i) => (
                    <li key={i} className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{num.split(' ')[0]}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">{num.split(' ').slice(1).join(' ').replace(/[()]/g, '')}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
