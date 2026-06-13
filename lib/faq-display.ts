import type { CountryFaqEntry, FaqCategoryId } from "@/types/country"
import type { CountrySourceEntry } from "@/types/source"

export const FAQ_CATEGORY_IDS: FaqCategoryId[] = [
    "documents",
    "speed_limits",
    "vignette_tolls",
    "fines",
    "winter",
    "motorcycles",
    "rental",
]

export const FAQ_CATEGORY_LABEL_KEYS: Record<FaqCategoryId | "all", string> = {
    all: "category_all",
    documents: "category_documents",
    speed_limits: "category_speed_limits",
    vignette_tolls: "category_vignette_tolls",
    fines: "category_fines",
    winter: "category_winter",
    motorcycles: "category_motorcycles",
    rental: "category_rental",
}

export function resolveFaqText(entry: CountryFaqEntry, lang: string) {
    const useGerman = lang === "de" && entry.question_de
    return {
        question: useGerman ? entry.question_de! : entry.question,
        answer: useGerman && entry.answer_de ? entry.answer_de : entry.answer,
    }
}

export function resolveRelatedLabel(link: { label: string; label_de?: string }, lang: string) {
    return lang === "de" && link.label_de ? link.label_de : link.label
}

export function matchesFaqSearch(entry: CountryFaqEntry, query: string, lang: string) {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return true

    const { question, answer } = resolveFaqText(entry, lang)
    const haystack = [question, answer, entry.question, entry.answer, entry.question_de, entry.answer_de]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

    return haystack.includes(trimmed)
}

export function filterFaqs(
    entries: CountryFaqEntry[],
    category: FaqCategoryId | "all",
    query: string,
    lang: string
) {
    return entries.filter((entry) => {
        if (category !== "all" && entry.category !== category) return false
        return matchesFaqSearch(entry, query, lang)
    })
}

export function countFaqsByCategory(entries: CountryFaqEntry[]) {
    const counts: Record<FaqCategoryId | "all", number> = {
        all: entries.length,
        documents: 0,
        speed_limits: 0,
        vignette_tolls: 0,
        fines: 0,
        winter: 0,
        motorcycles: 0,
        rental: 0,
    }

    for (const entry of entries) {
        if (entry.category) counts[entry.category] += 1
    }

    return counts
}

export function resolveFaqSourceLinks(
    sourceIds: string[] | undefined,
    sources: CountrySourceEntry[]
) {
    if (!sourceIds?.length) return []

    const byId = new Map(sources.map((source) => [source.id, source]))
    return sourceIds
        .map((id) => byId.get(id))
        .filter((source): source is CountrySourceEntry => Boolean(source))
}

export function formatFaqResultsCount(count: number, labels: Record<string, string>) {
    if (count === 1) {
        return labels.results_found_one ?? "1 question found"
    }
    return (labels.results_found ?? "{count} questions found").replace("{count}", String(count))
}
