"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeroSearchProps {
    placeholder: string
}

interface CountryResult {
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

function getLangPrefix() {
    const pathSegments = window.location.pathname.split("/")
    return pathSegments[1] && pathSegments[1].length === 2 ? `/${pathSegments[1]}` : "/en"
}

export function HeroSearch({ placeholder }: HeroSearchProps) {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [results, setResults] = useState<CountryResult[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        const trimmedQuery = debouncedQuery.trim()

        if (!trimmedQuery) {
            setResults([])
            setLoading(false)
            return
        }

        const controller = new AbortController()
        const lang = getLangPrefix().replace("/", "") || "en"

        setLoading(true)
        fetch(`/api/countries/search?q=${encodeURIComponent(trimmedQuery)}&lang=${lang}`, {
            signal: controller.signal,
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Search request failed with ${res.status}`)
                return res.json()
            })
            .then((data) => {
                setResults(data)
            })
            .catch((err) => {
                if (err.name === "AbortError") return
                console.error("Failed to fetch countries", err)
                setResults([])
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            })

        return () => controller.abort()
    }, [debouncedQuery])

    const handleSelect = (routeKey: string) => {
        const countryCode = routeKey.trim().toUpperCase()
        if (countryCode) {
            router.push(`${getLangPrefix()}/country/${countryCode}`)
        }
    }

    const handleSubmit = () => {
        const trimmedQuery = query.trim()
        if (trimmedQuery) {
            router.push(`${getLangPrefix()}/countries?q=${encodeURIComponent(trimmedQuery)}`)
        }
    }

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
                <Search className="h-5 w-5" />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                className="h-14 w-full sm:w-[300px] bg-zinc-900/60 backdrop-blur-md border border-zinc-700 text-white rounded-xl pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSubmit()
                    }
                }}
            />
            {loading && (
                <div className="absolute right-3 top-4 text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            )}

            {results.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1">
                    {results.map((country) => (
                        <button
                            type="button"
                            key={country.routeKey}
                            className="flex w-full items-center gap-3 border-b border-zinc-800 px-4 py-3 text-left transition-colors last:border-0 hover:bg-zinc-800"
                            onClick={() => handleSelect(country.routeKey)}
                        >
                            <div className="relative h-6 w-10 overflow-hidden rounded border border-zinc-700 shadow-sm">
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
        </div>
    )
}
