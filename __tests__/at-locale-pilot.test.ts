import fs from "fs"
import path from "path"
import { mergeCountryLocale } from "@/lib/country-locale-merge"
import { resolveFaqText } from "@/lib/faq-display"
import {
    resolveCategoryTitle,
    resolveFineAmount,
    resolveRowLabel,
    resolveSummaryText,
    resolveSummaryTitle,
} from "@/lib/fines-display"
import type { CountryData } from "@/types/country"

const dataDir = path.join(process.cwd(), "data", "countries")

function loadJson<T>(fileName: string): T {
    return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), "utf8")) as T
}

describe("AT locale pilot (at.de.json)", () => {
    const base = loadJson<CountryData>("at.json")
    const locale = loadJson<Partial<CountryData>>("at.de.json")
    const merged = mergeCountryLocale(base, locale)

    it("loads a partial locale file with FAQ and traffic fines only", () => {
        expect(locale.iso2).toBe("AT")
        expect(locale.faq?.length).toBe(base.faq?.length)
        expect(locale.traffic_fines?.categories?.length).toBe(base.traffic_fines?.categories?.length)
        expect(locale.summary).toBeUndefined()
        expect(locale.rules).toBeUndefined()
    })

    it("keeps English rules and summary after merge", () => {
        expect(merged.summary).toBe(base.summary)
        expect(merged.rules.seatbelt_rules).toBe(base.rules.seatbelt_rules)
    })

    it("matches legacy _de FAQ text after merge", () => {
        for (const entry of base.faq ?? []) {
            const mergedEntry = merged.faq?.find((item) => item.id === entry.id)
            expect(mergedEntry).toBeDefined()

            const legacy = resolveFaqText(entry, "de")
            const fromLocale = resolveFaqText(mergedEntry!, "de")

            expect(fromLocale.question).toBe(legacy.question)
            expect(fromLocale.answer).toBe(legacy.answer)
            expect(mergedEntry?.question).toBe(entry.question_de)
            expect(mergedEntry?.answer).toBe(entry.answer_de)
        }
    })

    it("matches legacy _de traffic fine text after merge", () => {
        for (const category of base.traffic_fines?.categories ?? []) {
            const mergedCategory = merged.traffic_fines?.categories?.find((item) => item.id === category.id)
            expect(mergedCategory).toBeDefined()
            expect(resolveCategoryTitle(mergedCategory!, "de")).toBe(resolveCategoryTitle(category, "de"))

            for (const row of category.rows) {
                const mergedRow = mergedCategory!.rows.find((item) => item.id === row.id)
                expect(mergedRow).toBeDefined()
                expect(resolveRowLabel(mergedRow!, "de")).toBe(resolveRowLabel(row, "de"))
                expect(resolveFineAmount(mergedRow!.consequences, "de")).toBe(
                    resolveFineAmount(row.consequences, "de")
                )
            }
        }

        for (const summary of base.traffic_fines?.summaries ?? []) {
            const mergedSummary = merged.traffic_fines?.summaries?.find((item) => item.id === summary.id)
            expect(mergedSummary).toBeDefined()
            expect(resolveSummaryTitle(mergedSummary!, "de")).toBe(resolveSummaryTitle(summary, "de"))
            expect(resolveSummaryText(mergedSummary!, "de")).toBe(resolveSummaryText(summary, "de"))
        }
    })
})
