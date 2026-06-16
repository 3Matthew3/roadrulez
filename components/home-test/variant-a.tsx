import Link from "next/link"
import { BookOpen, Car, Gauge, HelpCircle } from "lucide-react"
import { HeroSearch } from "@/components/hero-search"
import { CountryPreviewCard } from "@/components/home-test/country-preview-card"
import { HomeHeroShell } from "@/components/home-test/home-hero-shell"
import { HomeTestVariantNav } from "@/components/home-test/variant-nav"
import type { HomeTestContext } from "@/lib/home-test-shared"

export function HomeTestVariantA({ lang, ctx }: { lang: string; ctx: HomeTestContext }) {
    const { dict, popular, previewCountry, previewName, availableCount } = ctx
    const home = dict.home
    const statsLine = home.guides_stats.replace("{count}", String(availableCount))

    const categories = [
        { icon: BookOpen, label: home.categories.driving_rules },
        { icon: Car, label: home.categories.vehicle },
        { icon: Gauge, label: home.categories.limits },
        { icon: HelpCircle, label: home.categories.fines_faq },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-[#0a0e17] text-white">
            <HomeHeroShell centered>
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                        {home.hero_title_1}{" "}
                        <span className="bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-transparent">
                            {home.hero_title_2}
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-zinc-300 md:text-xl">
                        {home.hero_subtitle}
                    </p>

                    <div className="mx-auto mt-8 max-w-lg">
                        <HeroSearch
                            placeholder={home.search_placeholder || dict.common.search_placeholder}
                        />
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs uppercase tracking-wider text-zinc-500">
                            {dict.countries_page.popular_title}:
                        </span>
                        {popular.slice(0, 6).map((country) => (
                            <Link
                                key={country.iso2}
                                href={`/${lang}/country/${country.iso2.toLowerCase()}`}
                                className="rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-blue-500/50 hover:bg-zinc-800/80 hover:text-white"
                            >
                                {country.displayName}
                            </Link>
                        ))}
                    </div>
                </div>
            </HomeHeroShell>

            <section className="border-t border-zinc-800/50 py-16">
                <div className="container px-4 md:px-6">
                    <h2 className="text-center text-2xl font-semibold text-white">{home.what_you_get}</h2>
                    <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4">
                        {categories.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-800/40 to-zinc-900/20 p-5 text-center backdrop-blur-sm"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="mt-3 text-sm font-medium leading-snug text-zinc-200">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {previewCountry && (
                <section className="border-t border-zinc-800/50 py-16">
                    <div className="container px-4 md:px-6">
                        <div className="mx-auto max-w-2xl">
                            <CountryPreviewCard
                                lang={lang}
                                countryName={previewName}
                                data={previewCountry}
                                viewGuideLabel={dict.countries_page.view_guide}
                                liveExampleLabel={home.live_example}
                                topFineLabel={home.preview_top_fine}
                                faqLabel={home.preview_faq}
                            />
                        </div>
                    </div>
                </section>
            )}

            <section className="border-t border-zinc-800/50 py-16">
                <div className="container px-4 text-center md:px-6">
                    <p className="text-zinc-400">{statsLine}</p>
                    <Link
                        href={`/${lang}/countries`}
                        className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
                    >
                        {home.browse_all_countries}
                    </Link>
                </div>
            </section>

            <HomeTestVariantNav lang={lang} active="a" />
        </div>
    )
}
