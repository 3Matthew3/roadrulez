"use client"

import { useState } from "react"
import { RegionalVariation } from "@/types/country"
import { ChevronDown, AlertTriangle, MapPin } from "lucide-react"

interface RegionSelectorProps {
    variations: RegionalVariation[]
    labels: {
        title: string
        description: string
        nationwide_default: string
        notes_heading: string
        specific_overrides: string
        speed_limits: string
        urban: string
        rural: string
        select_prompt: string
    }
}

export default function RegionSelector({ variations, labels }: RegionSelectorProps) {
    const [selectedRegion, setSelectedRegion] = useState<RegionalVariation | null>(null)

    if (!variations || variations.length === 0) return null

    return (
        <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-2 text-amber-500 mb-4">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-xl font-semibold">{labels.title}</h3>
            </div>
            <p className="text-slate-400 mb-6">
                {labels.description}
            </p>

            <div className="relative max-w-md">
                <select
                    className="w-full appearance-none bg-slate-900 border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    onChange={(e) => {
                        const region = variations.find(v => v.region_name === e.target.value) || null
                        setSelectedRegion(region)
                    }}
                    defaultValue=""
                >
                    <option value="">{labels.nationwide_default}</option>
                    {variations.map((v) => (
                        <option key={v.region_name} value={v.region_name}>
                            {v.region_name} ({v.region_type})
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
            </div>

            {/* Region Content Card */}
            {selectedRegion ? (
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/30 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-blue-400" />
                        <h4 className="text-lg font-bold text-white">{labels.notes_heading.replace("{region}", selectedRegion.region_name)}</h4>
                    </div>

                    {selectedRegion.notes && (
                        <p className="text-slate-300 mb-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                            {selectedRegion.notes}
                        </p>
                    )}

                    {selectedRegion.differences && Object.keys(selectedRegion.differences).length > 0 && (
                        <div className="space-y-3">
                            <h5 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{labels.specific_overrides}</h5>
                            {selectedRegion.differences.speed_limits && (
                                <div className="text-slate-300">
                                    <span className="text-blue-300 font-semibold">{labels.speed_limits}</span>
                                    <span className="opacity-80"> {labels.urban}: {selectedRegion.differences.speed_limits.urban}, {labels.rural}: {selectedRegion.differences.speed_limits.rural}</span>
                                    {selectedRegion.differences.speed_limits.notes && <div className="text-xs text-slate-500 italic mt-1">{selectedRegion.differences.speed_limits.notes}</div>}
                                </div>
                            )}
                            {/* Add other specific overrides here as needed */}
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-6 p-6 rounded-xl border border-slate-800/50 text-slate-600 italic">
                    {labels.select_prompt}
                </div>
            )}
        </div>
    )
}
