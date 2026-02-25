/**
 * Publish Validation Tests
 * Tests the validation logic from /api/admin/countries/[id]/publish/route.ts
 */

/** Mirror the validation function from the publish route */
function validateForPublish(country: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!country.name || country.name.trim() === "") errors.push("Country name is required")
    if (!country.iso2 || country.iso2.trim() === "") errors.push("ISO2 code is required")
    if (!country.summary || country.summary.trim() === "") errors.push("Summary is required before publishing")
    if (!country.sources || country.sources.length === 0) errors.push("At least one source is required before publishing")
    return { valid: errors.length === 0, errors }
}

const validCountry = {
    name: "Germany",
    iso2: "DE",
    summary: "German traffic rules overview...",
    sources: [{ id: "src_1", title: "ADAC Guide", url: "https://adac.de" }],
    status: "VERIFIED",
}

describe("Publish Validation", () => {
    it("passes for a fully filled country", () => {
        const { valid, errors } = validateForPublish(validCountry)
        expect(valid).toBe(true)
        expect(errors).toHaveLength(0)
    })

    it("fails when name is missing", () => {
        const { valid, errors } = validateForPublish({ ...validCountry, name: "" })
        expect(valid).toBe(false)
        expect(errors).toContain("Country name is required")
    })

    it("fails when iso2 is missing", () => {
        const { valid, errors } = validateForPublish({ ...validCountry, iso2: "" })
        expect(valid).toBe(false)
        expect(errors).toContain("ISO2 code is required")
    })

    it("fails when summary is missing", () => {
        const { valid, errors } = validateForPublish({ ...validCountry, summary: "" })
        expect(valid).toBe(false)
        expect(errors).toContain("Summary is required before publishing")
    })

    it("fails when sources array is empty", () => {
        const { valid, errors } = validateForPublish({ ...validCountry, sources: [] })
        expect(valid).toBe(false)
        expect(errors).toContain("At least one source is required before publishing")
    })

    it("fails when sources is null/undefined", () => {
        const { valid, errors } = validateForPublish({ ...validCountry, sources: null })
        expect(valid).toBe(false)
        expect(errors).toContain("At least one source is required before publishing")
    })

    it("collects multiple errors at once", () => {
        const { valid, errors } = validateForPublish({
            name: "",
            iso2: "",
            summary: "",
            sources: [],
        })
        expect(valid).toBe(false)
        expect(errors).toHaveLength(4)
    })

    it("allows publishing when status is DRAFT (no status restriction)", () => {
        // Status transition is checked separately (not in validateForPublish)
        const { valid } = validateForPublish({ ...validCountry, status: "DRAFT" })
        expect(valid).toBe(true)
    })
})
