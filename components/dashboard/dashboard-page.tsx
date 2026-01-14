"use client"

import { useState } from "react"
import { DashboardSidebar, Continent } from "@/components/dashboard/sidebar"
// We import directly here because we are in a client component, 
// but we might need the wrapper if Leaflet issues persist. 
// Actually, MapWrapper handles the dynamic import.
import MapWrapper from "@/components/map/map-wrapper"
import { CountrySearch } from "@/components/country-search"

export default function DashboardPage() {
    const [selectedContinent, setSelectedContinent] = useState<Continent>("All")

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <DashboardSidebar
                selectedContinent={selectedContinent}
                onSelectContinent={setSelectedContinent}
            />

            <div className="flex-1 relative bg-background">
                {/* Floating Search Bar */}
                <div className="absolute top-4 left-4 right-4 z-[400] max-w-md mx-auto pointer-events-none">
                    <div className="pointer-events-auto shadow-2xl rounded-xl overflow-hidden bg-background/80 backdrop-blur-md border">
                        <CountrySearch />
                    </div>
                </div>

                {/* Map Area */}
                <div className="h-full w-full">
                    {/* We pass the key to force re-render or pass props to control zoom */}
                    <MapWrapper
                        key={selectedContinent}
                        className="z-0"
                        selectedContinent={selectedContinent}
                    />
                </div>
            </div>
        </div>
    )
}
