"use client"

import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouter } from 'next/navigation'
import { Continent } from '@/components/dashboard/sidebar'

// Helper for colors
const stringToColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const h = Math.abs(hash) % 360
    return `hsl(${h}, 60%, 40%)` // Slightly darker for vector look
}

interface MapLibreProps {
    selectedContinent?: Continent
    className?: string
}

const CONTINENT_BOUNDS: Record<string, [[number, number], [number, number]]> = {
    "Europe": [[-25, 34], [45, 72]], // SW, NE
    "Asia": [[25, -10], [150, 80]],
    "North America": [[-170, 15], [-50, 85]],
    "South America": [[-90, -60], [-30, 15]],
    "Africa": [[-20, -35], [55, 38]],
    "Oceania": [[110, -50], [180, 0]]
}

export default function MapLibreClient({ selectedContinent, className }: MapLibreProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const router = useRouter()
    const [mapLoaded, setMapLoaded] = useState(false)

    useEffect(() => {
        if (map.current) return; // Initialize only once

        // Ensure container is empty (cleanup artifact)
        if (mapContainer.current) {
            mapContainer.current.innerHTML = ''
        }

        try {
            // Initialize Map
            map.current = new maplibregl.Map({
                container: mapContainer.current!,
                style: {
                    version: 8,
                    sources: {
                        'carto-dark': {
                            type: 'raster',
                            tiles: [
                                "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
                                "https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png"
                            ],
                            tileSize: 256,
                            attribution: '&copy; OpenStreetMap &copy; CARTO'
                        }
                    },
                    layers: [
                        {
                            id: 'basemap-tiles',
                            type: 'raster',
                            source: 'carto-dark',
                            minzoom: 0,
                            maxzoom: 22
                        },
                        {
                            id: 'background',
                            type: 'background',
                            paint: {
                                'background-color': '#111'
                            }
                        }
                    ]
                },
                center: [0, 20],
                zoom: 2,
                // maxBounds: [[-180, -85], [180, 85]] // Removed to prevent potential bounds error during init
            })
        } catch (e) {
            console.error("Map initialization failed:", e)
            return
        }

        map.current.on('load', async () => {
            // 1. Fetch Data Manually to Inject Colors
            let data;
            try {
                const res = await fetch('/countries.geo.json')
                data = await res.json()
            } catch (e) {
                console.error("Failed to load country data", e)
                return
            }

            // 2. Inject Color Index (0-4) into properties
            data.features = data.features.map((f: any, i: number) => ({
                ...f,
                id: i,
                properties: { ...f.properties, colorIndex: i % 5 }
            }))

            setMapLoaded(true)
            const m = map.current!

            // Add Country Source with pre-processed data
            m.addSource('countries', {
                type: 'geojson',
                data: data,
                generateId: false // IDs are already set
            })

            // 1. Fill Layer (Colors)
            // Using match expression on the injected 'colorIndex' property
            m.addLayer({
                id: 'countries-fill',
                type: 'fill',
                source: 'countries',
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#ffffff',
                        [
                            'match',
                            ['get', 'colorIndex'],
                            0, '#a78bfa', // Purple
                            1, '#f472b6', // Pink
                            2, '#60a5fa', // Blue
                            3, '#34d399', // Green
                            4, '#fbbf24', // Amber
                            '#94a3b8'     // Fallback
                        ]
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.3,
                        0.6
                    ]
                }
            })

            // 2. Line Layer (Borders)
            m.addLayer({
                id: 'countries-line',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': 'rgba(255,255,255,0.1)',
                    'line-width': 1
                }
            })

            // REMOVED: Symbol Layer (was causing "big dots")

            // Interaction: Hover
            let hoveredId: string | number | undefined = undefined

            m.on('mousemove', 'countries-fill', (e) => {
                if (e.features && e.features.length > 0) {
                    if (hoveredId !== undefined) {
                        m.setFeatureState({ source: 'countries', id: hoveredId }, { hover: false })
                    }
                    hoveredId = e.features[0].id
                    if (hoveredId !== undefined) {
                        m.setFeatureState({ source: 'countries', id: hoveredId }, { hover: true })
                    }
                    m.getCanvas().style.cursor = 'pointer'
                }
            })

            m.on('mouseleave', 'countries-fill', () => {
                if (hoveredId !== undefined) {
                    m.setFeatureState({ source: 'countries', id: hoveredId }, { hover: false })
                }
                hoveredId = undefined
                m.getCanvas().style.cursor = ''
            })

            // Interaction: Click
            m.on('click', 'countries-fill', (e) => {
                if (e.features && e.features[0]) {
                    const feature = e.features[0]
                    const name = feature.properties.name
                    m.flyTo({ center: e.lngLat, zoom: 5 })
                    router.push(`/country/${encodeURIComponent(name)}`)
                }
            })

            // Popup
            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'country-popup'
            })

            m.on('mousemove', 'countries-fill', (e) => {
                const name = e.features?.[0]?.properties?.name
                if (name) {
                    popup.setLngLat(e.lngLat)
                        .setHTML(`<div class="font-bold text-sm text-slate-900 px-2 py-1">${name}</div>`)
                        .addTo(m)
                }
            })

            m.on('mouseleave', 'countries-fill', () => {
                popup.remove()
            })
        })

        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [router])

    // Continent effect
    useEffect(() => {
        if (!map.current || !mapLoaded || !selectedContinent || selectedContinent === "All") return

        const bounds = CONTINENT_BOUNDS[selectedContinent]
        if (bounds) {
            map.current.fitBounds(bounds, { padding: 40 })
        }
    }, [selectedContinent, mapLoaded])

    return <div ref={mapContainer} className={`h-full w-full ${className}`} />
}
