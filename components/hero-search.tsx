"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeroSearchProps {
    placeholder: string
}

export function HeroSearch({ placeholder }: HeroSearchProps) {
    const router = useRouter()

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
                <Search className="h-5 w-5" />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                className="h-14 w-full sm:w-[300px] bg-zinc-900/60 backdrop-blur-md border border-zinc-700 text-white rounded-xl pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-500"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        // We need the lang parameter to route correctly. 
                        // Since this input is likely used inside /[lang]/page.tsx, the current path starts with /[lang].
                        // Let's assume the parent passes the lang or we parse it, OR we simply use window.location (fragile).
                        // Better: pass lang as prop or use relative routing?
                        // "next/navigation" params? 

                        // Simplest: just push to `?q=...` relative path if we are on root? No, we are on /[lang].
                        // `router.push('search?q=...')` will append to current path.
                        // If we are at /en, `router.push('search')` goes to /en/search. Correct.
                        router.push(`search?q=${e.currentTarget.value}`)
                    }
                }}
            />
        </div>
    )
}
