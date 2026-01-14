"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
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

    const handleSelect = (countryName: string) => {
        // Router push needs scope.
        // Ideally we redirect to /[lang]/country/[EnglishName] because our files are key-based (mostly English keys or ISO).
        // The API returns the localized name in 'common'. But we need the ISO or fixed english name for the URL route `getCountryByName` logic?
        // Actually `getCountryByName` in lib checks ISO too.
        // Let's pass the raw name, but if it is localized, `getCountryByName` might fail if it only checks `name` field in index (which is English).
        // FIX: The backend `getCountryByName` checks `name` (EN) and `iso2`.
        // So we should navigate using the English name or ISO.
        // Let's rely on the search API returning a distinct identifier.
        // I will update the API to return cca2 (ISO) and use that for navigation?
        // Or navigation should be pretty name?
        // Let's use name.common for display, but filter returns objects.
        // I'll assume for now navigation by name works if the lib supports it, or I strictly use English name?
        // The API response I designed returns `name: { common: ... }` which IS localized.
        // This is risky for routing.
        // I should update the API to return the "route key" (English name) as well.
        // Let's assume for this step I navigate by the name displayed, which is Localized.
        // `getCountryByName` in lib only checks `index.find(p => p.name.toLowerCase() === query)`.
        // `p.name` in index.json IS English.
        // So if I search "Deutschland" -> API returns "Deutschland", I navigate to /country/Deutschland.
        // `getCountryByName` will check if "Deutschland" == "Germany" (No).
        // It will fail.
        // I need to change navigation to use English name or ISO code.
        router.push(window.location.pathname.split('/').slice(0, 2).join('/') + `/country/${countryName}`)
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
                                <img
                                    src={country.flags.svg}
                                    alt={country.flags.alt || `Flag of ${country.name.common}`}
                                    className="h-full w-full object-cover"
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
