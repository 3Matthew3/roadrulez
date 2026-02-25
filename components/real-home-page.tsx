import Link from "next/link"
import { Globe, Car, ChevronRight, Info, Shield, Smartphone, Clock, Map as MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDictionary } from "@/lib/dictionaries"
import { getAllCountries } from "@/lib/countries"
import { HeroSearch } from "@/components/hero-search"

// ISO codes for popular countries
const POPULAR_ISO_CODES = ["DE", "FR", "IT", "ES", "US", "JP"]

interface RealHomePageProps {
    lang: string
}

export async function RealHomePage({ lang }: RealHomePageProps) {
    const dict = await getDictionary(lang)
    const allCountries = await getAllCountries()

    const popularCountries = POPULAR_ISO_CODES.map(code => {
        const country = allCountries.find(c => c.iso2 === code)
        if (!country) return null
        return {
            ...country,
            displayName: country.names?.[lang] || country.name
        }
    }).filter(Boolean)

    return (
        <div className="flex min-h-screen flex-col">
            {/* Hero Section */}
            <section className="relative flex flex-col justify-center min-h-[90vh] -mt-16 overflow-hidden bg-[#0a0e17]">
                {/* Background Image / Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/70 via-[#0a0e17]/50 to-[#0a0e17] z-10" />
                    <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-blue-600/20 blur-[120px] rounded-full z-10 pointer-events-none" />
                    {/* Using standard img tag for simplicity with the prompt's asset handling */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/hero-globe.png"
                        alt="World Map Background"
                        className="w-full h-full object-cover object-right opacity-90"
                    />
                </div>

                <div className="container relative z-20 px-4 md:px-6 pt-20">
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            {dict.home.hero_title_1} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-500">
                                {dict.home.hero_title_2}
                            </span>
                        </h1>
                        <p className="max-w-[700px] text-lg text-zinc-300 md:text-xl leading-relaxed">
                            {dict.home.hero_subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href={`/${lang}/map`}>
                                <Button
                                    size="lg"
                                    className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-900/20 rounded-xl w-full sm:w-auto"
                                >
                                    {dict.home.cta_map}
                                </Button>
                            </Link>

                            <HeroSearch placeholder={dict.home.search_placeholder || dict.common.search_placeholder} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Access Section */}
            <section className="relative z-20 py-12 bg-[#0a0e17]">
                <div className="container px-4 md:px-6">
                    <h2 className="text-2xl font-semibold text-white mb-6">{dict.home.popular_destinations}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {popularCountries.map((country: any) => (
                            <Link
                                key={country.iso2}
                                href={`/${lang}/country/${country.iso2}`}

                                className="group grid grid-cols-[3rem_1fr] items-center gap-4 p-4 pl-8 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:bg-zinc-800/80 hover:border-blue-500/50 transition-all duration-300"
                            >
                                <div className="relative h-8 w-12 overflow-hidden rounded shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://flagcdn.com/w160/${country.iso2.toLowerCase()}.png`}
                                        alt={`${country.displayName} flag`}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                                <span className="font-medium text-zinc-100 group-hover:text-white truncate">{country.displayName}</span>
                            </Link>
                        ))}
                        <Link
                            href={`/${lang}/map`}
                            className="col-span-2 md:col-span-2 group flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:bg-zinc-800/80 hover:border-blue-500/50 transition-all duration-300 text-zinc-300 hover:text-white"
                        >
                            <span className="font-medium pl-2">{dict.home.more_countries}</span>
                            <ChevronRight className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="relative z-20 py-16 bg-[#0a0e17] border-t border-zinc-800/50">
                <div className="container px-4 md:px-6">
                    <h2 className="text-2xl font-semibold text-white mb-8">{dict.home.how_it_works}</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-800/40 to-zinc-900/20 border border-zinc-800 backdrop-blur-sm">
                            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                <Globe className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">{dict.home.step_1_title}</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {dict.home.step_1_desc}
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-800/40 to-zinc-900/20 border border-zinc-800 backdrop-blur-sm">
                            <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                                <Info className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">{dict.home.step_2_title}</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {dict.home.step_2_desc}
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-800/40 to-zinc-900/20 border border-zinc-800 backdrop-blur-sm">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                                <Car className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">{dict.home.step_3_title}</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {dict.home.step_3_desc}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features List */}
            <section className="relative z-20 py-20 bg-[#0a0e17]">
                <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Globe className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-medium text-zinc-200">{dict.home.features.global}</span>
                        </div>
                        <div className="h-px bg-zinc-800 w-full" />
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <Car className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-medium text-zinc-200">{dict.home.features.traveler}</span>
                        </div>
                        <div className="h-px bg-zinc-800 w-full" />
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                                <Smartphone className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-medium text-zinc-200">{dict.home.features.mobile}</span>
                        </div>
                        <div className="h-px bg-zinc-800 w-full" />
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-medium text-zinc-200">{dict.home.features.updated}</span>
                        </div>
                    </div>

                    {/* Decorative Earth Glow */}
                    <div className="relative h-[400px] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
                        <div className="absolute inset-0 bg-blue-600/10 blur-3xl opacity-50" />
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                            {/* Interactive Map Preview Placeholder */}
                            <div className="text-center p-6">
                                <MapIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p>{dict.home.features.map_preview}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
