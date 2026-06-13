"use client"

import { ExternalLink, Leaf, MapPin, Mountain, ParkingCircle, Snowflake, Link2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { getAustriaStateCoatUrl } from "@/lib/austria-state-coats"
import type { RegionalRuleHighlight, RegionalVariation } from "@/types/country"

interface RegionalRulesAccordionProps {
    variations: RegionalVariation[]
    lang: string
}

const ICON_MAP = {
    parking: { icon: ParkingCircle, className: "bg-blue-500/15 text-blue-300" },
    environment: { icon: Leaf, className: "bg-emerald-500/15 text-emerald-300" },
    mountain: { icon: Mountain, className: "bg-amber-500/15 text-amber-300" },
    toll: { icon: Link2, className: "bg-orange-500/15 text-orange-300" },
    winter: { icon: Snowflake, className: "bg-cyan-500/15 text-cyan-300" },
    chains: { icon: Snowflake, className: "bg-slate-500/15 text-slate-300" },
} as const

function regionHighlights(region: RegionalVariation): RegionalRuleHighlight[] {
    if (region.highlights?.length) return region.highlights
    if (region.notes) {
        return [{ title: region.region_name, description: region.notes, icon: "mountain" }]
    }
    return []
}

function ruleCountLabel(count: number, lang: string) {
    if (lang === "de") {
        return count === 1 ? "1 Besonderheit" : `${count} Besonderheiten`
    }
    return count === 1 ? "1 special rule" : `${count} special rules`
}

function badgeClass(count: number) {
    if (count === 1) return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
    if (count >= 3) return "border-amber-500/30 bg-amber-500/15 text-amber-300"
    return "border-blue-500/30 bg-blue-500/15 text-blue-300"
}

function RegionCoat({ region }: { region: RegionalVariation }) {
    const coatUrl = getAustriaStateCoatUrl(region)

    if (!coatUrl) {
        return (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/80">
                <MapPin className="h-4 w-4 text-slate-400" />
            </span>
        )
    }

    return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-600 bg-white/95 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={coatUrl}
                alt=""
                className="h-full w-full object-contain"
            />
        </span>
    )
}

export default function RegionalRulesAccordion({ variations, lang }: RegionalRulesAccordionProps) {
    const isGerman = lang === "de"
    const defaultOpen = variations[0]?.region_name

    const t = {
        title: isGerman ? "Besondere Regeln nach Region" : "Special regional rules",
        intro: isGerman
            ? "In Österreich können Regeln je nach Bundesland und Stadt variieren. Klicke auf eine Region, um die Besonderheiten zu sehen."
            : "In Austria, rules can vary by state and city. Click on a region to see local differences.",
        learnMore: isGerman ? "Mehr erfahren" : "Learn more",
        noteTitle: isGerman ? "Bitte beachten" : "Please note",
        noteBody: isGerman
            ? "Regionale Besonderheiten ergänzen die nationalen Regeln. Maßgeblich sind immer die Schilder und Vorschriften vor Ort."
            : "Regional rules supplement national defaults. Always follow signs and local regulations on the road.",
    }

    if (variations.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[#1E293B] p-5 md:p-6">
            <div className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#3B82F6]" />
                    <h3 className="text-lg font-semibold text-white">{t.title}</h3>
                </div>
                <p className="max-w-2xl text-sm text-slate-400">{t.intro}</p>
            </div>

            <Accordion type="single" collapsible defaultValue={defaultOpen} className="space-y-2 border-none">
                {variations.map((region) => {
                    const highlights = regionHighlights(region)
                    const count = highlights.length

                    return (
                        <AccordionItem
                            key={region.region_name}
                            value={region.region_name}
                            className="mb-0 rounded-xl border border-slate-700 bg-slate-800/40"
                        >
                            <AccordionTrigger className="px-4 py-4 text-white hover:bg-slate-800/60 hover:no-underline">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <RegionCoat region={region} />
                                    <span className="truncate font-semibold">{region.region_name}</span>
                                    <span
                                        className={cn(
                                            "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                            badgeClass(count)
                                        )}
                                    >
                                        {ruleCountLabel(count, lang)}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="border-t border-slate-700 px-0 pb-0 pt-0">
                                <ul className="divide-y divide-slate-700">
                                    {highlights.map((rule) => {
                                        const iconKey = rule.icon ?? "mountain"
                                        const meta = ICON_MAP[iconKey] ?? ICON_MAP.mountain
                                        const RuleIcon = meta.icon

                                        return (
                                            <li key={rule.title} className="px-4 py-4">
                                                <div className="flex gap-3">
                                                    <div
                                                        className={cn(
                                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                                            meta.className
                                                        )}
                                                    >
                                                        <RuleIcon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold leading-snug text-white">
                                                            {rule.title}
                                                        </p>
                                                        <p className="mt-1 text-sm leading-relaxed text-slate-400">
                                                            {rule.description}
                                                        </p>
                                                        {rule.learnMoreUrl && (
                                                            <a
                                                                href={rule.learnMoreUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#3B82F6] hover:underline"
                                                            >
                                                                {t.learnMore}
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>

            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3.5">
                <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                        <span className="text-sm font-bold">i</span>
                    </div>
                    <div>
                        <p className="font-semibold text-white">{t.noteTitle}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-400">{t.noteBody}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
