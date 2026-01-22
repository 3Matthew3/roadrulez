import { CountryData } from "@/types/country"

interface TrafficSignsGridProps {
    data: CountryData
    dict: any
}

export default function TrafficSignsGrid({ data, dict }: TrafficSignsGridProps) {
    if (!data.road_signs || data.road_signs.length === 0) return null

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">{dict.extra.road_signs}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.road_signs.map((sign, i) => (
                    <div key={i} className="group relative rounded-xl bg-slate-900/50 border border-slate-800 p-4 flex flex-col items-center text-center hover:bg-slate-800/50 transition-colors">
                        <div className="h-24 w-24 mb-3 relative">
                            <img src={sign.image_url} alt={sign.title} className="h-full w-full object-contain" />
                        </div>
                        <span className="font-medium text-white mb-1">{sign.title}</span>
                        <span className="text-xs text-slate-500 leading-tight">{sign.description}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
