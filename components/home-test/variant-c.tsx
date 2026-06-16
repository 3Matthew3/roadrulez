import Link from "next/link"
import { Car, ChevronRight, CreditCard, ShieldAlert } from "lucide-react"
import { HeroSearch } from "@/components/hero-search"
import { HomeHeroShell } from "@/components/home-test/home-hero-shell"
import { HomeTestVariantNav } from "@/components/home-test/variant-nav"
import type { HomeTestContext } from "@/lib/home-test-shared"

export function HomeTestVariantC({ lang, ctx }: { lang: string; ctx: HomeTestContext }) {
    const { dict, labels } = ctx
    const home = dict.home

    const intents = [
        {
            icon: Car,
            title: labels.intentRental,
            description: labels.intentRentalDesc,
            href: `/${lang}/countries`,
            exampleHref: `/${lang}/country/at/faq`,
            exampleLabel: "AT FAQ",
        },
        {
            icon: ShieldAlert,
            title: labels.intentFines,
            description: labels.intentFinesDesc,
            href: `/${lang}/countries`,
            exampleHref: `/${lang}/country/at/fines`,
            exampleLabel: lang === "de" ? "AT Bußgelder" : "AT fines",
        },
        {
            icon: CreditCard,
            title: labels.intentTolls,
            description: labels.intentTollsDesc,
            href: `/${lang}/countries`,
            exampleHref: `/${lang}/country/at/faq`,
            exampleLabel: lang === "de" ? "AT Vignette" : "AT vignette",
        },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-[#0a0e17] text-white">
            <HomeHeroShell centered className="min-h-[55vh]">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                        {home.hero_title_1}{" "}
                        <span className="bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-transparent">
                            {home.hero_title_2}
                        </span>
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed text-zinc-300">{home.hero_subtitle}</p>
                    <div className="mx-auto mt-8 max-w-lg">
                        <HeroSearch
                            placeholder={home.search_placeholder || dict.common.search_placeholder}
                        />
                    </div>
                </div>
            </HomeHeroShell>

            <section className="border-t border-zinc-800/50 py-16">
                <div className="container px-4 md:px-6">
                    <p className="mx-auto max-w-2xl text-center text-sm font-medium uppercase tracking-wider text-zinc-500">
                        {labels.thenPickCountry}
                    </p>

                    <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
                        {intents.map(({ icon: Icon, title, description, href, exampleHref, exampleLabel }) => (
                            <div
                                key={title}
                                className="flex flex-col rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-800/40 to-zinc-900/20 p-5 backdrop-blur-sm"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
                                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                                    {description}
                                </p>
                                <div className="mt-5 space-y-2">
                                    <Link
                                        href={href}
                                        className="flex items-center justify-between rounded-lg border border-zinc-700/60 px-3 py-2.5 text-sm text-zinc-200 transition hover:border-blue-500/40 hover:text-white"
                                    >
                                        {home.browse_all_countries}
                                        <ChevronRight className="h-4 w-4 opacity-60" />
                                    </Link>
                                    <Link
                                        href={exampleHref}
                                        className="block text-center text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        {labels.exampleLink}: {exampleLabel} →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <HomeTestVariantNav lang={lang} active="c" />
        </div>
    )
}
