import { mergeCountryLocale, mergeIdArray } from "@/lib/country-locale-merge"
import type { CountryData } from "@/types/country"

const baseCountry: CountryData = {
    name_en: "Austria",
    name_local: "Österreich",
    iso2: "AT",
    iso3: "AUT",
    continent: "Europe",
    flag: "🇦🇹",
    drive_side: "right",
    summary: "English summary",
    common_traps: ["Trap one", "Trap two"],
    rental_and_idp_notes: "English rental notes",
    last_verified: "2026-01-01",
    status: "verified",
    sources: ["https://example.com/en"],
    rules: {
        speed_limits: {
            urban: 50,
            rural: 100,
            motorway: 130,
            units: "km/h",
            notes: "English speed notes",
        },
        alcohol_limit: { value: 0.5, unit: "‰", notes: "English alcohol notes" },
        seatbelt_rules: "English seatbelt rules",
        child_seat_rules: "English child seat rules",
        phone_usage_rules: "English phone rules",
        headlights_rules: "English headlights rules",
        priority_rules: "English priority rules",
        tolls: { required: true, type: "vignette", notes: "English toll notes" },
        parking_rules: "English parking rules",
        mandatory_equipment: ["Warning triangle"],
        winter_rules: "English winter rules",
        emergency_numbers: ["112"],
    },
    faq: [
        {
            id: "vignette-required",
            question: "Do I need a vignette?",
            answer: "Yes, on motorways.",
        },
        {
            id: "speed-limits",
            question: "What are the speed limits?",
            answer: "50/100/130 km/h.",
        },
    ],
    traffic_fines: {
        summaries: [
            {
                id: "speeding",
                title: "Speeding",
                summary: "English speeding summary",
                maxConsequence: "Fine",
            },
        ],
        categories: [
            {
                id: "speeding",
                title: "Speeding",
                rows: [
                    {
                        id: "speed-10",
                        label: "+10 km/h",
                        consequences: { fine: "€30" },
                        appliesTo: ["car"],
                    },
                ],
            },
        ],
    },
    source_entries: [
        {
            id: "at-asfinag-vignette",
            title: "ASFINAG vignette",
            url: "https://example.com/vignette",
            sourceType: "GOVERNMENT",
            trustLevel: "PRIMARY",
        },
    ],
}

describe("mergeIdArray", () => {
    it("merges arrays with ids entry-by-entry", () => {
        const merged = mergeIdArray(
            [
                { id: "a", question: "Q1", answer: "A1" },
                { id: "b", question: "Q2", answer: "A2" },
            ],
            [{ id: "a", answer: "German A1" }]
        )

        expect(merged).toEqual([
            { id: "a", question: "Q1", answer: "German A1" },
            { id: "b", question: "Q2", answer: "A2" },
        ])
    })

    it("replaces arrays without ids entirely", () => {
        const merged = mergeIdArray(
            [
                { question: "Old Q1", answer: "Old A1" },
                { question: "Old Q2", answer: "Old A2" },
            ],
            [{ question: "New Q", answer: "New A" }]
        )

        expect(merged).toEqual([{ question: "New Q", answer: "New A" }])
    })
})

describe("mergeCountryLocale", () => {
    it("keeps English fields when locale file is partial", () => {
        const merged = mergeCountryLocale(baseCountry, {
            summary: "Deutsche Zusammenfassung",
        })

        expect(merged.summary).toBe("Deutsche Zusammenfassung")
        expect(merged.rules.seatbelt_rules).toBe("English seatbelt rules")
        expect(merged.faq).toHaveLength(2)
        expect(merged.faq?.[0].question).toBe("Do I need a vignette?")
    })

    it("merges FAQ entries by id and keeps untranslated FAQ in English", () => {
        const merged = mergeCountryLocale(baseCountry, {
            faq: [
                {
                    id: "vignette-required",
                    question: "Brauche ich eine Vignette?",
                    answer: "Ja, auf Autobahnen und Schnellstraßen.",
                },
            ],
        })

        expect(merged.faq?.[0]).toEqual({
            id: "vignette-required",
            question: "Brauche ich eine Vignette?",
            answer: "Ja, auf Autobahnen und Schnellstraßen.",
        })
        expect(merged.faq?.[1]).toEqual(baseCountry.faq?.[1])
    })

    it("merges nested traffic fine rows by id", () => {
        const merged = mergeCountryLocale(baseCountry, {
            traffic_fines: {
                summaries: [
                    {
                        id: "speeding",
                        summary: "Deutsche Zusammenfassung",
                    },
                ],
                categories: [
                    {
                        id: "speeding",
                        rows: [
                            {
                                id: "speed-10",
                                label: "+10 km/h außerorts",
                                consequences: { fine: "€30" },
                                appliesTo: ["car"],
                            },
                        ],
                    },
                ],
            },
        })

        expect(merged.traffic_fines?.summaries?.[0]).toMatchObject({
            id: "speeding",
            title: "Speeding",
            summary: "Deutsche Zusammenfassung",
            maxConsequence: "Fine",
        })
        expect(merged.traffic_fines?.categories?.[0].rows?.[0]).toMatchObject({
            id: "speed-10",
            label: "+10 km/h außerorts",
            consequences: { fine: "€30" },
        })
    })

    it("merges rule notes without dropping other rule fields", () => {
        const merged = mergeCountryLocale(baseCountry, {
            rules: {
                speed_limits: {
                    notes: "Deutsche Tempo-Hinweise",
                },
            },
        })

        expect(merged.rules.speed_limits).toMatchObject({
            urban: 50,
            rural: 100,
            motorway: 130,
            units: "km/h",
            notes: "Deutsche Tempo-Hinweise",
        })
        expect(merged.rules.alcohol_limit.notes).toBe("English alcohol notes")
    })

    it("replaces string arrays without ids entirely", () => {
        const merged = mergeCountryLocale(baseCountry, {
            common_traps: ["Falle eins"],
        })

        expect(merged.common_traps).toEqual(["Falle eins"])
    })
})
