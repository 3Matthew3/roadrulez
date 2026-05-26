"use client"

import { Globe, Map as MapIcon, Compass, Navigation, Layers, Mountain } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export type Continent = "All" | "Europe" | "Asia" | "North America" | "South America" | "Africa" | "Oceania"

interface SidebarProps {
    selectedContinent: Continent
    onSelectContinent: (continent: Continent) => void
    labels: {
        regions: string
        filter_by_continent: string
        pro_title: string
        pro_description: string
        continents: Record<Continent, string>
    }
}

const continents: { name: Continent; icon: any }[] = [
    { name: "All", icon: Globe },
    { name: "Europe", icon: Mountain },
    { name: "Asia", icon: Layers },
    { name: "North America", icon: Navigation },
    { name: "South America", icon: Compass },
    { name: "Africa", icon: MapIcon },
    { name: "Oceania", icon: Globe },
]

export function DashboardSidebar({ selectedContinent, onSelectContinent, labels }: SidebarProps) {
    return (
        <div className="w-64 bg-card border-r flex flex-col h-[calc(100vh-4rem)]">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg tracking-tight">{labels.regions}</h2>
                <p className="text-xs text-muted-foreground">{labels.filter_by_continent}</p>
            </div>
            <div className="flex-1 py-4 overflow-y-auto">
                <nav className="space-y-1 px-2">
                    {continents.map((continent) => {
                        const Icon = continent.icon
                        return (
                            <Button
                                key={continent.name}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3",
                                    selectedContinent === continent.name && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => onSelectContinent(continent.name)}
                            >
                                <Icon className="h-4 w-4" />
                                {labels.continents[continent.name]}
                            </Button>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t bg-muted/20">
                <div className="rounded-lg bg-card border p-3 shadow-sm">
                    <h3 className="font-medium text-sm">{labels.pro_title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {labels.pro_description}
                    </p>
                </div>
            </div>
        </div>
    )
}
