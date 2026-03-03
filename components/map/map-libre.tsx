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

        // Preload name → ISO2 lookup from our own API
        let nameToIso2: Record<string, string> = {}
        fetch('/api/countries/search?q=a&lang=en')
            .then(r => r.json())
            .catch(() => []) // silently ignore errors

        // Better: fetch the full countries index
        fetch('/api/countries/search?q=&lang=en')
            .catch(() => null)

        // We'll load our own countries list via a separate endpoint.
        // For now, build the lookup lazily by fetching a broader list.
        // The GeoJSON feature.properties.name is the English country name.
        // We pass it along as-is and let the country page handle fuzzy resolution.
        // Actually the simplest fix: navigate by country name slug, which the page already handles.
        // Better fix: preload /api/countries/all (a new endpoint), or reuse the GeoJSON id field.
        // BEST fix for now: on click, search our API for that name and get the ISO2.

        try {
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
                renderWorldCopies: false,
            })
        } catch (e) {
            console.error("Map initialization failed:", e)
            return
        }

        map.current.on('load', async () => {
            // 1. Load name→ISO2 lookup index
            try {
                const indexRes = await fetch('/api/countries/index')
                if (indexRes.ok) {
                    const index: { iso2: string; name: string; names?: Record<string, string> }[] = await indexRes.json()
                    nameToIso2 = {}
                    for (const c of index) {
                        nameToIso2[c.name.toLowerCase()] = c.iso2
                        if (c.names) {
                            for (const n of Object.values(c.names)) {
                                if (n) nameToIso2[n.toLowerCase()] = c.iso2
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not load country index for map:", e)
            }

            // 2. Fetch GeoJSON
            let data;
            try {
                const res = await fetch('/countries.geo.json')
                data = await res.json()
            } catch (e) {
                console.error("Failed to load country data", e)
                return
            }

            // FILTER: Remove Antarctica
            data.features = data.features.filter((f: any) => f.id !== 'ATA' && f.properties.name !== 'Antarctica');

            // 3. Inject Color Index (0-4) into properties
            data.features = data.features.map((f: any, i: number) => ({
                ...f,
                id: i,
                properties: { ...f.properties, colorIndex: i % 5 }
            }))

            setMapLoaded(true)
            const m = map.current!

            m.addSource('countries', {
                type: 'geojson',
                data: data,
                generateId: false
            })

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
                            0, '#a78bfa',
                            1, '#f472b6',
                            2, '#60a5fa',
                            3, '#34d399',
                            4, '#fbbf24',
                            '#94a3b8'
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

            m.addLayer({
                id: 'countries-line',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': 'rgba(255,255,255,0.1)',
                    'line-width': 1
                }
            })

            // Hover interaction
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

            // Click: resolve country name → ISO2, then navigate
            m.on('click', 'countries-fill', (e) => {
                if (e.features && e.features[0]) {
                    const name = e.features[0].properties?.name as string | undefined
                    if (!name) return

                    const iso2 = nameToIso2[name.toLowerCase()]
                    if (!iso2) {
                        console.warn(`No ISO2 found for country: ${name}`)
                        return
                    }

                    const langPrefix = window.location.pathname.split('/').slice(0, 2).join('/')
                    m.flyTo({ center: e.lngLat, zoom: 5 })
                    router.push(`${langPrefix}/country/${iso2.toUpperCase()}`)
                }
            })

            // Popup on hover
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
