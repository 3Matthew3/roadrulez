import { AlertCircle } from "lucide-react"
import { CountryData } from "@/types/country"

interface RequirementsCardProps {
    data: CountryData
    dict: any
}

export default function RequirementsCard({ data, dict }: RequirementsCardProps) {
    if (!data.idp_requirement && !data.rental_and_idp_notes) return null

    return (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {dict.common.requirements || "Before You Go"}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
                {data.idp_requirement && (
                    <div>
                        <h4 className="text-sm uppercase tracking-wider text-amber-500/80 mb-1">IDP Requirement</h4>
                        <p className="text-xl font-bold text-white">{data.idp_requirement}</p>
                    </div>
                )}
                {data.rental_and_idp_notes && (
                    <div>
                        <h4 className="text-sm uppercase tracking-wider text-amber-500/80 mb-1">Notes</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{data.rental_and_idp_notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
