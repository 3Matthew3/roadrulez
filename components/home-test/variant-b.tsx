import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { HeroSearch } from "@/components/hero-search"
import { HomeHeroShell } from "@/components/home-test/home-hero-shell"
import { HomeTestVariantNav } from "@/components/home-test/variant-nav"
import type { HomeTestContext } from "@/lib/home-test-shared"

export function HomeTestVariantB({ lang, ctx }: { lang: string; ctx: HomeTestContext }) {
    const { dict, popular } = ctx
    const home = dict.home
    const featured = popular.slice(0, 6)

    return (
        <div className="flex min-h-screen flex-col bg-[#0a0e17] text-white">
            <HomeHeroShell centered className="min-h-[70vh]">
                <div className="mx-auto w-full max-w-2xl">
                    <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                        {home.hero_title_1}{" "}
                        <span className="bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-transparent">
                            {home.hero_title_2}
                        </span>
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                        {home.hero_subtitle}
                    </p>

                    <div className="mx-auto mt-8 max-w-md">
                        <HeroSearch
                            placeholder={home.search_placeholder || dict.common.search_placeholder}
                        />
                    </div>
                </div>
            </HomeHeroShell>

            <section className="border-t border-zinc-800/50 py-12">
                <div className="container px-4 md:px-6">
                    <h2 className="mb-6 text-center text-lg font-semibold text-zinc-300">
                        {dict.countries_page.popular_title}
                    </h2>
                    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
                        {featured.map((country) => (
                            <Link
                                key={country.iso2}
                                href={`/${lang}/country/${country.iso2.toLowerCase()}`}
                                className="group grid grid-cols-[3rem_1fr] items-center gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4 transition hover:border-blue-500/50 hover:bg-zinc-800/80"
                            >
                                <div className="relative h-8 w-12 overflow-hidden rounded shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://flagcdn.com/w160/${country.iso2.toLowerCase()}.png`}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                                <span className="truncate font-medium text-zinc-100 group-hover:text-white">
                                    {country.displayName}
                                </span>
                            </Link>
                        ))}
                    </div>

                    <Link
                        href={`/${lang}/countries`}
                        className="mx-auto mt-6 flex max-w-4xl items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4 text-zinc-300 transition hover:border-blue-500/50 hover:text-white"
                    >
                        <span className="font-medium">{home.browse_all_countries}</span>
                        <ChevronRight className="h-5 w-5 opacity-60" />
                    </Link>
                </div>
            </section>

            <HomeTestVariantNav lang={lang} active="b" />
        </div>
    )
}
