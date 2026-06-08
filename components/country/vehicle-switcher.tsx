"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Car, Bike } from "lucide-react"
import { cn } from "@/lib/utils"

interface VehicleSwitcherProps {
    currentVehicle: string
    labels: {
        car: string
        motorcycle: string
        moped: string
    }
    variant?: "default" | "austria"
}

export default function VehicleSwitcher({
    currentVehicle,
    labels,
    variant = "default",
}: VehicleSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isAustria = variant === "austria"

    const handleSwitch = (vehicle: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (vehicle === "car") {
            params.delete("vehicle")
        } else {
            params.set("vehicle", vehicle)
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    const shellClass = isAustria
        ? "flex w-fit rounded-xl border border-[#E2E8F0] bg-white/90 p-1 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80"
        : "flex w-fit rounded-lg border border-slate-700 bg-slate-800/50 p-1"

    const activeClass = isAustria
        ? "bg-[#DC2626] text-white shadow-sm"
        : "bg-blue-600 text-white shadow-sm"

    const inactiveClass = isAustria
        ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        : "text-slate-400 hover:text-slate-200"

    const buttons = [
        { id: "car", icon: Car, label: labels.car, scale: false },
        { id: "motorcycle", icon: Bike, label: labels.motorcycle, scale: false },
        { id: "moped", icon: Bike, label: labels.moped, scale: true },
    ] as const

    return (
        <div className={shellClass}>
            {buttons.map(({ id, icon: Icon, label, scale }) => (
                <button
                    key={id}
                    onClick={() => handleSwitch(id)}
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        currentVehicle === id ? activeClass : inactiveClass
                    )}
                >
                    <Icon className={cn("h-4 w-4", scale && "scale-75")} />
                    {label}
                </button>
            ))}
        </div>
    )
}
