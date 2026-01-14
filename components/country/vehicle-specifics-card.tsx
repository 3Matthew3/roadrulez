import { AlertTriangle, Info, CheckCircle2, Ban } from "lucide-react"
import { VehicleRules } from "@/types/country"

interface VehicleSpecificsCardProps {
    vehicleType: "motorcycle" | "moped"
    rules: Partial<VehicleRules>
    labels: any // pass dictionary subset
}

export default function VehicleSpecificsCard({ vehicleType, rules, labels }: VehicleSpecificsCardProps) {
    if (!rules.helmet_rules && !rules.lane_splitting_rules && !rules.motorway_access) {
        return null
    }

    return (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-blue-100 flex items-center gap-2 capitalized">
                <Info className="h-5 w-5 text-blue-400" />
                {vehicleType === 'motorcycle' ? labels.vehicle.motorcycle : labels.vehicle.moped} {labels.rules.detailed_rules}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
                {rules.helmet_rules && (
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{labels.vehicle_specifics?.helmet || "Helmet"}</span>
                        <p className="text-slate-300 text-sm">{rules.helmet_rules}</p>
                    </div>
                )}
                {rules.lane_splitting_rules && (
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{labels.vehicle_specifics?.lane_splitting || "Lane Splitting"}</span>
                        <p className="text-slate-300 text-sm">{rules.lane_splitting_rules}</p>
                    </div>
                )}
                {rules.motorway_access && (
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{labels.vehicle_specifics?.motorway || "Motorway Access"}</span>
                        <p className="text-slate-300 text-sm">{rules.motorway_access}</p>
                    </div>
                )}
                {rules.licensing_notes && (
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{labels.vehicle_specifics?.licensing || "Licensing"}</span>
                        <p className="text-slate-300 text-sm">{rules.licensing_notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
