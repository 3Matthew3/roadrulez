import HeroImage from "@/components/country/hero-image"
import VehicleSwitcher from "@/components/country/vehicle-switcher"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { CountryData } from "@/types/country"

interface CountryHeroProps {
    data: CountryData
    localizedName: string
    dict: any
    vehicleType: string
}

export default function CountryHero({ data, localizedName, dict, vehicleType }: CountryHeroProps) {
    const driveSideLabel = data.drive_side === 'right' ? dict.common.right : dict.common.left

    return (
        <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#111] z-0">
                <HeroImage name={data.name_en} images={data.header_images} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/60 to-transparent z-10" />
            </div>

            <div className="container relative z-20 h-full flex flex-col justify-end pb-12 px-8 md:px-10">
                <div className="flex items-center gap-6 mb-4">
                    <div className="relative h-16 w-24 md:h-20 md:w-32 shadow-lg rounded-lg overflow-hidden border border-slate-700/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`https://flagcdn.com/w320/${data.iso2.toLowerCase()}.png`}
                            alt={`${localizedName} flag`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{localizedName}</h1>
                        <div className="flex items-center gap-2 text-slate-400 mt-2">
                            <Info className="h-4 w-4 text-blue-400" />
                            <span>{dict.props.drive_side}: <span className="text-white font-semibold capitalize">{driveSideLabel}</span></span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs text-slate-500 font-mono">
                    <VehicleSwitcher
                        currentVehicle={vehicleType}
                        labels={dict.vehicle}
                    />
                    <div className="flex items-center gap-4">
                        <span>{dict.common.last_verified}: {data.last_verified}</span>
                        <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10 uppercase text-[10px]">
                            {data.status}
                        </Badge>
                        {data.data_coverage && (
                            <Badge variant="outline" className={`uppercase text-[10px] ${data.data_coverage === 'high' ? 'text-green-400 border-green-500/20 bg-green-500/10' :
                                data.data_coverage === 'medium' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' :
                                    'text-slate-400 border-slate-500/20 bg-slate-500/10'
                                }`}>
                                {dict.extra.data_coverage}: {data.data_coverage}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
