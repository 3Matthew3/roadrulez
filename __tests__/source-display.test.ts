import {
    categorizeSource,
    filterSourcesByStatsFilter,
    getPublicSourceBadgeKey,
    getSourceStats,
    getSourceUsageLabelKeys,
    getTrustDisplay,
    groupSources,
    matchesSourceSearch,
    shouldGroupSources,
} from "@/lib/source-display"
import type { CountrySourceEntry } from "@/types/source"

const official: CountrySourceEntry = {
    id: "1",
    title: "Government portal",
    url: "https://example.gov",
    sourceType: "GOVERNMENT",
    trustLevel: "PRIMARY",
    publisher: "Republic of Austria",
    moduleKey: "driving_basics",
}

const club: CountrySourceEntry = {
    id: "2",
    title: "Automobile club",
    url: "https://example.club",
    sourceType: "AUTOMOBILE_ASSOCIATION",
    trustLevel: "TRUSTED_SECONDARY",
    publisher: "ÖAMTC",
    moduleKey: "requirements",
}

describe("source-display", () => {
    it("computes source statistics", () => {
        expect(getSourceStats([official, club])).toEqual({
            total: 2,
            official: 1,
            supplementary: 1,
        })
    })

    it("maps trust display for official government sources", () => {
        expect(getTrustDisplay(official)).toEqual({
            labelKey: "trust_official_government",
            icon: "shield",
        })
    })

    it("maps public badge keys without internal trust labels", () => {
        expect(getPublicSourceBadgeKey(official)).toBe("badge_official_government")
        expect(getPublicSourceBadgeKey(club)).toBe("badge_automobile_club")
    })

    it("groups sources by category", () => {
        const groups = groupSources([official, club])
        expect(groups).toHaveLength(2)
        expect(groups[0].id).toBe("OFFICIAL")
        expect(groups[1].id).toBe("AUTOMOBILE_ASSOCIATION")
    })

    it("enables grouping once enough sources exist", () => {
        const sources = Array.from({ length: 5 }, (_, index) => ({
            ...official,
            id: String(index),
        }))
        expect(shouldGroupSources(sources)).toBe(true)
    })

    it("maps module usage labels from usageModuleKeys", () => {
        const source: CountrySourceEntry = {
            ...official,
            usageModuleKeys: ["driving_basics", "tolls"],
        }
        expect(getSourceUsageLabelKeys(source)).toEqual([
            "usage_driving_licence",
            "usage_traffic_rules",
            "usage_vehicle_duties",
            "usage_tolls_vignette",
        ])
    })

    it("filters sources by stats category", () => {
        expect(filterSourcesByStatsFilter([official, club], "all")).toHaveLength(2)
        expect(filterSourcesByStatsFilter([official, club], "official")).toEqual([official])
        expect(filterSourcesByStatsFilter([official, club], "supplementary")).toEqual([club])
    })

    it("filters sources by title, publisher, and notes", () => {
        expect(matchesSourceSearch(official, "austria")).toBe(true)
        expect(matchesSourceSearch(club, "government")).toBe(false)
        expect(categorizeSource(official)).toBe("OFFICIAL")
        expect(categorizeSource(club)).toBe("AUTOMOBILE_ASSOCIATION")
    })
})
