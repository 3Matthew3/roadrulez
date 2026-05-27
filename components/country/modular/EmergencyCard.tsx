import { Siren } from "lucide-react"
import { CountryInlineEditContext, TrafficRules } from "@/types/country"
import { InlineEdit } from "@/components/inline-edit"

interface EmergencyCardProps {
    rules: TrafficRules
    dict: any
    inlineEdit?: CountryInlineEditContext
}

export default function EmergencyCard({ rules, dict, inlineEdit }: EmergencyCardProps) {
    const editable = inlineEdit?.enabled ? inlineEdit : null
    const renderNumbers = (value: unknown) => (
        <ul className="space-y-3">
            {(Array.isArray(value) ? value : []).map((num, i) => (
                <li key={i} className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{String(num).split(' ')[0]}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{String(num).split(' ').slice(1).join(' ').replace(/[()]/g, '')}</span>
                </li>
            ))}
        </ul>
    )

    return (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <Siren className="h-5 w-5" /> {dict.rules.emergency}
            </h3>
            {editable ? (
                <InlineEdit
                    countryCode={editable.countryCode}
                    field="emergency_numbers"
                    value={rules.emergency_numbers}
                    renderValue={renderNumbers}
                />
            ) : renderNumbers(rules.emergency_numbers)}
        </div>
    )
}
