import { Car } from "lucide-react"
import { TrafficRules } from "@/types/country"

interface SpeedLimitsCardProps {
    rules: TrafficRules
    status: string
    dict: any
}

function convertSpeed(value: number, unit: "km/h" | "mph"): string {
    if (unit === "mph") {
        // mph to km/h (approx 1.61)
        return `${Math.round(value * 1.60934)} km/h`
    } else {
        // km/h to mph (approx 0.62)
        return `${Math.round(value * 0.621371)} mph`
    }
}

export default function SpeedLimitsCard({ rules, status, dict }: SpeedLimitsCardProps) {
    return (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" /> {dict.rules.speed_limits} <span className="text-xs text-slate-500 font-normal">({status})</span>
            </h3>
            <ul className="space-y-3 text-slate-300">
                <li className="flex justify-between border-b border-slate-800 pb-2">
                    <span>{dict.rules.urban}</span>
                    <span className="font-bold text-white">
                        {rules.speed_limits.urban} <span className="text-sm font-normal text-slate-500">{rules.speed_limits.units}</span>
                        <span className="text-xs text-slate-500 ml-1 font-normal">
                            ({convertSpeed(rules.speed_limits.urban, rules.speed_limits.units)})
                        </span>
                    </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                    <span>{dict.rules.rural}</span>
                    <span className="font-bold text-white">
                        {rules.speed_limits.rural} <span className="text-sm font-normal text-slate-500">{rules.speed_limits.units}</span>
                        <span className="text-xs text-slate-500 ml-1 font-normal">
                            ({convertSpeed(rules.speed_limits.rural, rules.speed_limits.units)})
                        </span>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>{dict.rules.motorway}</span>
                    <span className="font-bold text-white">
                        {rules.speed_limits.motorway} <span className="text-sm font-normal text-slate-500">{rules.speed_limits.units}</span>
                        <span className="text-xs text-slate-500 ml-1 font-normal">
                            ({convertSpeed(rules.speed_limits.motorway, rules.speed_limits.units)})
                        </span>
                    </span>
                </li>
            </ul>
            {rules.speed_limits.notes && (
                <p className="text-xs text-slate-500 mt-4 italic">
                    {rules.speed_limits.notes}
                </p>
            )}
        </div>
    )
}
