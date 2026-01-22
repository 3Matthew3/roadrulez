import { CountryData, TrafficRules } from "@/types/country"

interface DrivingBasicsProps {
    data: CountryData
    rules: TrafficRules
    dict: any
}

export default function DrivingBasics({ data, rules, dict }: DrivingBasicsProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">{dict.rules.driving_basics}</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <h4 className="text-slate-400 text-sm uppercase mb-1">{dict.props.drive_side}</h4>
                    <p className="text-white font-medium capitalize">
                        {data.drive_side === 'right' ? dict.common.right : dict.common.left}
                    </p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <h4 className="text-slate-400 text-sm uppercase mb-1">{dict.props.priority}</h4>
                    <p className="text-white font-medium">{rules.priority_rules}</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <h4 className="text-slate-400 text-sm uppercase mb-1">{dict.props.seatbelts}</h4>
                    <p className="text-slate-300 text-sm">{rules.seatbelt_rules}</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <h4 className="text-slate-400 text-sm uppercase mb-1">{dict.props.child_seats}</h4>
                    <p className="text-slate-300 text-sm">{rules.child_seat_rules}</p>
                </div>
            </div>
        </div>
    )
}
