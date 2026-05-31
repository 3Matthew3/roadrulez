import { sanitizeAuthCallbackUrl } from "@/lib/auth-callback"

describe("sanitizeAuthCallbackUrl", () => {
    it("defaults to homepage locale when callback is missing", () => {
        expect(sanitizeAuthCallbackUrl(null)).toBe("/en")
    })

    it("fixes common admin login typos", () => {
        expect(sanitizeAuthCallbackUrl("/admin/logon")).toBe("/admin")
        expect(sanitizeAuthCallbackUrl("/admin/signin")).toBe("/admin")
    })

    it("allows valid admin destinations", () => {
        expect(sanitizeAuthCallbackUrl("/admin/countries")).toBe("/admin/countries")
        expect(sanitizeAuthCallbackUrl("/admin/source-reviews")).toBe("/admin/source-reviews")
    })

    it("blocks unknown admin paths", () => {
        expect(sanitizeAuthCallbackUrl("/admin/does-not-exist")).toBe("/admin")
    })

    it("allows public locale paths", () => {
        expect(sanitizeAuthCallbackUrl("/de/country/de")).toBe("/de/country/de")
    })
})
