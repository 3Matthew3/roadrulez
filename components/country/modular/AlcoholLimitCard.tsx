import { ThermometerSnowflake } from "lucide-react"
import { CountryInlineEditContext, TrafficRules } from "@/types/country"
import { InlineEdit } from "@/components/inline-edit"

interface AlcoholLimitCardProps {
    rules: TrafficRules
    dict: any
    inlineEdit?: CountryInlineEditContext
}

export default function AlcoholLimitCard({ rules, dict, inlineEdit }: AlcoholLimitCardProps) {
    const editable = inlineEdit?.enabled ? inlineEdit : null

    return (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <ThermometerSnowflake className="h-5 w-5" /> {dict.rules.alcohol_limit}
            </h3>
            <div className="mb-4">
                {editable ? (
                    <InlineEdit
                        countryCode={editable.countryCode}
                        field="alcohol_limit.value"
                        value={rules.alcohol_limit.value}
                        renderValue={(value) => (
                            <div className="text-3xl font-bold text-white mb-1">
                                {String(value)} <span className="text-base font-normal text-slate-400">{rules.alcohol_limit.unit}</span>
                            </div>
                        )}
                    />
                ) : (
                    <div className="text-3xl font-bold text-white mb-1">
                        {rules.alcohol_limit.value} <span className="text-base font-normal text-slate-400">{rules.alcohol_limit.unit}</span>
                    </div>
                )}
            </div>
            {rules.alcohol_limit.notes && (
                editable ? (
                    <InlineEdit
                        countryCode={editable.countryCode}
                        field="alcohol_limit.notes"
                        value={rules.alcohol_limit.notes}
                        renderValue={(value) => (
                            <p className="text-sm text-slate-400">
                                {String(value)}
                            </p>
                        )}
                    />
                ) : (
                    <p className="text-sm text-slate-400">
                        {rules.alcohol_limit.notes}
                    </p>
                )
            )}
        </div>
    )
}
