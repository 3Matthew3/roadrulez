import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json"
import { EXCLUDED_ISO2, getAllBrowseIso2Codes, getRegionForIso2 } from "@/lib/country-region-map"
import { REGION_ORDER } from "@/lib/countries-page-shared"

countries.registerLocale(enLocale)

describe("country-region-map", () => {
    it("maps every ISO country except excluded territories exactly once", () => {
        const allIso = Object.keys(countries.getNames("en"))
        const browseIso = new Set(getAllBrowseIso2Codes())
        const unmapped: string[] = []
        const duplicateChecks = new Map<string, number>()

        for (const iso2 of allIso) {
            if (EXCLUDED_ISO2.has(iso2)) continue
            if (!browseIso.has(iso2)) {
                unmapped.push(iso2)
            }
            const region = getRegionForIso2(iso2)
            if (region) {
                duplicateChecks.set(iso2, (duplicateChecks.get(iso2) ?? 0) + 1)
            }
        }

        expect(unmapped).toEqual([])
        for (const region of REGION_ORDER) {
            expect(getAllBrowseIso2Codes().filter((iso2) => getRegionForIso2(iso2) === region).length).toBeGreaterThan(0)
        }
    })
})
