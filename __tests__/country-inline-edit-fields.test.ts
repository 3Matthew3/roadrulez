import {
    canInlineEditCountry,
    isCountryInlineEditField,
    validateCountryInlineEditValue,
} from "@/lib/inline-edit/country-fields"

describe("Country inline edit field policy", () => {
    it("only allows admins to use inline editing initially", () => {
        expect(canInlineEditCountry("ADMIN")).toBe(true)
        expect(canInlineEditCountry("EDITOR")).toBe(false)
        expect(canInlineEditCountry(undefined)).toBe(false)
    })

    it("only recognizes whitelisted fields", () => {
        expect(isCountryInlineEditField("summary")).toBe(true)
        expect(isCountryInlineEditField("speed_limits.urban")).toBe(true)
        expect(isCountryInlineEditField("header_images")).toBe(false)
        expect(isCountryInlineEditField("users.role")).toBe(false)
    })

    it("validates simple text, numbers, and small lists", () => {
        expect(validateCountryInlineEditValue("summary", "  Safe driving summary  ")).toEqual({
            success: true,
            value: "Safe driving summary",
        })
        expect(validateCountryInlineEditValue("speed_limits.urban", "50")).toEqual({
            success: true,
            value: 50,
        })
        expect(validateCountryInlineEditValue("mandatory_equipment", ["Vest", "Triangle"])).toEqual({
            success: true,
            value: ["Vest", "Triangle"],
        })
    })

    it("rejects invalid values for whitelisted fields", () => {
        expect(validateCountryInlineEditValue("speed_limits.urban", 999).success).toBe(false)
        expect(validateCountryInlineEditValue("mandatory_equipment", new Array(21).fill("Item")).success).toBe(false)
        expect(validateCountryInlineEditValue("summary", "").success).toBe(false)
    })
})
