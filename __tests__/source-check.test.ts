import { normalizeSourceContent, hashSourceContent } from "@/lib/source-check"
import { extractSourceSuggestions, pickPrimarySuggestion } from "@/lib/source-patterns"

describe("source-check helpers", () => {
    it("normalizes html content consistently", () => {
        const raw = "<html><body><h1>Speed 50 km/h</h1><script>alert(1)</script></body></html>"
        expect(normalizeSourceContent(raw)).toBe("speed 50 km/h")
    })

    it("hashes normalized content deterministically", () => {
        const first = hashSourceContent("speed 50 km/h")
        const second = hashSourceContent("speed 50 km/h")
        expect(first).toBe(second)
        expect(first).toHaveLength(64)
    })
})

describe("source pattern extraction", () => {
    it("detects speed limits from text", () => {
        const suggestions = extractSourceSuggestions("Urban 50 km/h, rural 100 km/h, motorway 130 km/h", "speed_limits")
        expect(suggestions.length).toBeGreaterThan(0)
        expect(suggestions[0].moduleKey).toBe("speed_limits")
        const parsed = JSON.parse(suggestions[0].suggestedValue)
        expect(parsed.urban).toBe(50)
        expect(parsed.motorway).toBe(130)
    })

    it("detects alcohol limits from text", () => {
        const suggestions = extractSourceSuggestions("Blood alcohol limit is 0.5‰ for drivers", "alcohol_limit")
        expect(suggestions[0].moduleKey).toBe("alcohol_limit")
    })

    it("prefers module-specific suggestion when module key is set", () => {
        const suggestions = extractSourceSuggestions(
            "Urban 50 km/h and alcohol limit 0.5‰",
            "speed_limits"
        )
        const primary = pickPrimarySuggestion(suggestions, "speed_limits")
        expect(primary?.moduleKey).toBe("speed_limits")
    })
})
