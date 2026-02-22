"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Country {
    name: {
        common: string
        official: string
    }
    flags: {
        svg: string
        alt: string
    }
    routeKey: string
}

export function CountrySearch() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
    const [loading, setLoading] = useState(false)
    const [debouncedQuery, setDebouncedQuery] = useState("")

    // Simple debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setFilteredCountries([])
            setLoading(false)
            return
        }

        setLoading(true)
        // Get language from URL or default to 'en'. For client component, we might need a prop or hook.
        // Simplified: extracting from window location or just sending 'en'/detecting on server if needed.
        // For accurate client lang, better to use useParams call or pass as prop.
        const pathSegments = window.location.pathname.split('/')
        const lang = pathSegments[1] && pathSegments[1].length === 2 ? pathSegments[1] : 'en'

        fetch(`/api/countries/search?q=${encodeURIComponent(debouncedQuery)}&lang=${lang}`)
            .then((res) => res.json())
            .then((data) => {
                setFilteredCountries(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Failed to fetch countries", err)
                setFilteredCountries([])
                setLoading(false)
            })
    }, [debouncedQuery])

    const handleSelect = (iso2: string) => {
        const langPrefix = window.location.pathname.split('/').slice(0, 2).join('/')
        router.push(`${langPrefix}/country/${iso2.toUpperCase()}`)
    }

    // ...

    return (
        <div className="w-full">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search for a country (e.g., 'Germany', 'Japan')..."
                    className="flex h-12 w-full bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {filteredCountries.length > 0 && (
                <div className="rounded-lg border bg-popover text-popover-foreground shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {filteredCountries.map((country) => (
                        <button
                            key={country.routeKey}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-0"
                            onClick={() => handleSelect(country.routeKey)}
                        >
                            <div className="relative h-6 w-10 overflow-hidden rounded shadow-sm border">
                                <Image
                                    src={country.flags.svg}
                                    alt={country.flags.alt || `Flag of ${country.name.common}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <span className="font-medium">{country.name.common}</span>
                        </button>
                    ))}
                </div>
            )}

            {query && filteredCountries.length === 0 && !loading && (
                <div className="py-6 text-center text-muted-foreground">
                    No countries found for &quot;{query}&quot;.
                </div>
            )}
        </div>
    )
}
