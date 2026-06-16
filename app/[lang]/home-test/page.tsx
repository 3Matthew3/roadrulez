import type { Metadata } from "next"
import Link from "next/link"
import { HomeTestVariantNav } from "@/components/home-test/variant-nav"
import { getHomeTestContext } from "@/lib/home-test-shared"

export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

export default async function HomeTestIndexPage({ params }: { params: { lang: string } }) {
    const ctx = await getHomeTestContext(params.lang)
    const { labels } = ctx

    const variants = [
        { id: "a", title: labels.variantA, desc: labels.variantADesc },
        { id: "b", title: labels.variantB, desc: labels.variantBDesc },
        { id: "c", title: labels.variantC, desc: labels.variantCDesc },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-[#0a0e17] text-white">
            <div className="container px-4 py-20 md:px-6">
                <h1 className="text-3xl font-bold">{labels.indexTitle}</h1>
                <p className="mt-2 max-w-xl text-zinc-400">{labels.indexSubtitle}</p>

                <ul className="mt-10 grid gap-4 md:grid-cols-3">
                    {variants.map((variant) => (
                        <li key={variant.id}>
                            <Link
                                href={`/${params.lang}/home-test/${variant.id}`}
                                className="block h-full rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-800/40 to-zinc-900/20 p-6 transition hover:border-blue-500/40 hover:bg-zinc-800/60"
                            >
                                <h2 className="text-lg font-semibold text-white">{variant.title}</h2>
                                <p className="mt-2 text-sm text-zinc-400">{variant.desc}</p>
                                <span className="mt-4 inline-block text-sm font-medium text-blue-400">
                                    {labels.openVariant} →
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <HomeTestVariantNav lang={params.lang} active="index" />
        </div>
    )
}
