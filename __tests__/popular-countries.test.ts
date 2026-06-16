import {
    DEFAULT_POPULAR_COUNTRY_CODES,
    getManualPopularCountryCodesFromConfig,
    mergePopularCountryCodes,
    parsePlausibleCountryViewResults,
} from "@/lib/popular-countries"

describe("parsePlausibleCountryViewResults", () => {
    it("extracts valid catalog country codes in order", () => {
        const response = {
            results: [
                { dimensions: ["de"], metrics: [120] },
                { dimensions: ["AT"], metrics: [95] },
                { dimensions: ["xx"], metrics: [90] },
                { dimensions: ["FR"], metrics: [80] },
                { dimensions: ["FR"], metrics: [70] },
            ],
        }

        expect(parsePlausibleCountryViewResults(response)).toEqual(["DE", "AT", "FR"])
    })

    it("returns empty array for invalid responses", () => {
        expect(parsePlausibleCountryViewResults(null)).toEqual([])
        expect(parsePlausibleCountryViewResults({})).toEqual([])
    })
})

describe("mergePopularCountryCodes", () => {
    it("fills remaining slots from defaults", () => {
        expect(mergePopularCountryCodes(["US", "JP"], 4)).toEqual(["US", "JP", "AT", "DE"])
    })

    it("uses defaults when analytics list is empty", () => {
        expect(mergePopularCountryCodes([], 3)).toEqual(
            DEFAULT_POPULAR_COUNTRY_CODES.slice(0, 3)
        )
    })
})

describe("getManualPopularCountryCodesFromConfig", () => {
    it("reads codes from config object", () => {
        expect(getManualPopularCountryCodesFromConfig({ codes: ["CH", "NL", "xx"] })).toEqual([
            "CH",
            "NL",
        ])
    })

    it("falls back to defaults for invalid config", () => {
        expect(getManualPopularCountryCodesFromConfig({ codes: ["xx"] })).toEqual([
            ...DEFAULT_POPULAR_COUNTRY_CODES,
        ])
    })
})
