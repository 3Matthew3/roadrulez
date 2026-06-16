import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { CountryData } from "@/types/country"

export function CountryPreviewCard({
    lang,
    countryName,
    data,
    viewGuideLabel,
    liveExampleLabel,
    topFineLabel,
    faqLabel,
}: {
    lang: string
    countryName: string
    data: CountryData
    viewGuideLabel: string
    liveExampleLabel: string
    topFineLabel: string
    faqLabel: string
}) {
    const bullets = data.quick_answer_bullets?.slice(0, 3) ?? []
    const topFine = data.top_fines?.[0]
    const faq = data.faq?.[0]

    return (
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-800/40 to-zinc-900/20 p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-400/90">
                        {liveExampleLabel}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-white">
                        {data.flag} {countryName}
                    </h3>
                </div>
                <Link
                    href={`/${lang}/country/${data.iso2.toLowerCase()}`}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                    {viewGuideLabel}
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            {bullets.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                    {bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                            <span className="text-blue-400">•</span>
                            <span>{bullet}</span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {topFine && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            {topFineLabel}
                        </p>
                        <p className="mt-1 text-sm text-zinc-200">{topFine.title}</p>
                        <p className="text-sm font-semibold text-red-400">{topFine.amount}</p>
                    </div>
                )}
                {faq && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            {faqLabel}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-200">{faq.question}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
