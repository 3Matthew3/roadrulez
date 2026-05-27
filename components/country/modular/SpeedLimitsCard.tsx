import { Car } from "lucide-react"
import { CountryInlineEditContext, TrafficRules } from "@/types/country"
import { InlineEdit } from "@/components/inline-edit"
import { CountryInlineEditField, CountryInlineEditValue } from "@/lib/inline-edit/country-fields"

interface SpeedLimitsCardProps {
    rules: TrafficRules
    status: string
    dict: any
    inlineEdit?: CountryInlineEditContext
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

export default function SpeedLimitsCard({ rules, status, dict, inlineEdit }: SpeedLimitsCardProps) {
    const editable = inlineEdit?.enabled ? inlineEdit : null

    const renderSpeed = (value: CountryInlineEditValue) => {
        const speed = Number(value)

        if (speed <= 0) {
            return (
                <span className="font-bold text-amber-300">
                    {dict.rules.not_allowed || "Not allowed"}
                </span>
            )
        }

        return (
            <span className="font-bold text-white">
                {speed} <span className="text-sm font-normal text-slate-500">{rules.speed_limits.units}</span>
                <span className="text-xs text-slate-500 ml-1 font-normal">
                    ({convertSpeed(speed, rules.speed_limits.units)})
                </span>
            </span>
        )
    }

    const speedValue = (field: CountryInlineEditField, value: number) => (
        editable ? (
            <InlineEdit
                countryCode={editable.countryCode}
                field={field}
                value={value}
                className="text-right"
                renderValue={renderSpeed}
            />
        ) : renderSpeed(value)
    )

    return (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" /> {dict.rules.speed_limits} <span className="text-xs text-slate-500 font-normal">({status})</span>
            </h3>
            <ul className="space-y-3 text-slate-300">
                <li className="flex justify-between border-b border-slate-800 pb-2">
                    <span>{dict.rules.urban}</span>
                    {speedValue("speed_limits.urban", rules.speed_limits.urban)}
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                    <span>{dict.rules.rural}</span>
                    {speedValue("speed_limits.rural", rules.speed_limits.rural)}
                </li>
                <li className="flex justify-between">
                    <span>{dict.rules.motorway}</span>
                    {speedValue("speed_limits.motorway", rules.speed_limits.motorway)}
                </li>
            </ul>
            {rules.speed_limits.notes && (
                editable ? (
                    <InlineEdit
                        countryCode={editable.countryCode}
                        field="speed_limits.notes"
                        value={rules.speed_limits.notes}
                        className="mt-4"
                        renderValue={(value) => (
                            <p className="text-xs text-slate-500 italic">
                                {String(value)}
                            </p>
                        )}
                    />
                ) : (
                    <p className="text-xs text-slate-500 mt-4 italic">
                        {rules.speed_limits.notes}
                    </p>
                )
            )}
        </div>
    )
}
