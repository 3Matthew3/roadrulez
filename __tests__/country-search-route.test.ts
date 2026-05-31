import { NextRequest } from "next/server"
import { GET } from "@/app/api/countries/search/route"
import { getAllCountries } from "@/lib/countries"

jest.mock("@/lib/countries", () => ({
    getAllCountries: jest.fn(),
}))

const mockCountries = [
    {
        name: "Japan",
        names: {
            en: "Japan",
            de: "Japan",
            es: "Japon",
        },
        iso2: "JP",
        flag: "",
    },
    {
        name: "Germany",
        names: {
            en: "Germany",
            de: "Deutschland",
            es: "Alemania",
        },
        iso2: "DE",
        flag: "",
    },
]

describe("country search route", () => {
    beforeEach(() => {
        jest.mocked(getAllCountries).mockResolvedValue(mockCountries)
    })

    it("returns ISO2 route keys so country links resolve", async () => {
        const response = await GET(new NextRequest("http://localhost/api/countries/search?q=ja&lang=de"))
        const results = await response.json()

        expect(results[0]).toMatchObject({
            name: {
                common: "Japan",
                official: "Japan",
            },
            cca2: "JP",
            routeKey: "JP",
        })
    })

    it("matches country results after a single typed letter", async () => {
        const response = await GET(new NextRequest("http://localhost/api/countries/search?q=j&lang=en"))
        const results = await response.json()

        expect(results).toHaveLength(1)
        expect(results[0].routeKey).toBe("JP")
    })
})
