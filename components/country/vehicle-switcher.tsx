"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Car, Bike, Gem } from "lucide-react" // Gem as moped/scooter approx or use something else
import { cn } from "@/lib/utils"

interface VehicleSwitcherProps {
    currentVehicle: string
    labels: {
        car: string
        motorcycle: string
        moped: string
    }
}

export default function VehicleSwitcher({ currentVehicle, labels }: VehicleSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleSwitch = (vehicle: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (vehicle === 'car') {
            params.delete('vehicle')
        } else {
            params.set('vehicle', vehicle)
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex p-1 bg-slate-800/50 rounded-lg border border-slate-700 w-fit">
            <button
                onClick={() => handleSwitch('car')}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    currentVehicle === 'car' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
            >
                <Car className="h-4 w-4" />
                {labels.car}
            </button>
            <button
                onClick={() => handleSwitch('motorcycle')}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    currentVehicle === 'motorcycle' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
            >
                <Bike className="h-4 w-4" />
                {labels.motorcycle}
            </button>
            <button
                onClick={() => handleSwitch('moped')}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    currentVehicle === 'moped' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
            >
                {/* customized icon for moped */}
                <div className="relative">
                    <Bike className="h-4 w-4 scale-75" />
                </div>
                {labels.moped}
            </button>
        </div>
    )
}
