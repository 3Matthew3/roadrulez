import { Square } from "lucide-react"
import { CountryData, CountryInlineEditContext, TrafficRules } from "@/types/country"
import { InlineEdit } from "@/components/inline-edit"

interface ChecklistCardProps {
    data: CountryData
    rules: TrafficRules
    dict: any
    inlineEdit?: CountryInlineEditContext
}

export default function ChecklistCard({ data, rules, dict, inlineEdit }: ChecklistCardProps) {
    const editable = inlineEdit?.enabled ? inlineEdit : null
    const renderEquipment = (value: unknown) => {
        const items = Array.isArray(value) ? value : []

        return items.length > 0 ? (
            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                        <Square className="h-5 w-5 text-slate-600" />
                        {String(item)}
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-slate-500 text-sm">No specific equipment listed.</p>
        )
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">{dict.rules.checklist}</h3>
            <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6">
                <h4 className="font-medium text-white mb-4">{dict.rules.mandatory_equipment}</h4>
                {editable ? (
                    <InlineEdit
                        countryCode={editable.countryCode}
                        field="mandatory_equipment"
                        value={rules.mandatory_equipment}
                        renderValue={renderEquipment}
                    />
                ) : renderEquipment(rules.mandatory_equipment)}
            </div>

            <div className="rounded-xl border border-slate-800 p-6">
                <h4 className="font-medium text-white mb-2">{dict.rules.sources}</h4>
                <ul className="space-y-1 text-sm text-slate-500">
                    {data.sources.length > 0 ? data.sources.map((s, i) => (
                        <li key={i}>{s}</li>
                    )) : (
                        <li>Official Highway Code</li>
                    )}
                </ul>
            </div>
        </div>
    )
}
