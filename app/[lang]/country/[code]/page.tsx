import { ComingSoonCountry } from "@/components/coming-soon-country"
import { getCountryData, getAllCountries } from "@/lib/countries"
import { getDictionary } from "@/lib/dictionaries"
import { VehicleRules, TrafficRules } from "@/types/country"
import { canInlineEditCountry } from "@/lib/inline-edit/country-fields"
import { getStaffRoleFromCookies } from "@/lib/staff-session"
import CountryPremiumDashboard from "@/components/country/country-premium-dashboard"

interface PageProps {
    params: {
        code: string
        lang: string
    }
    searchParams: {
        vehicle?: string
    }
}

export default async function CountryPage({ params, searchParams }: PageProps) {
    const iso2 = params.code.toUpperCase()
    const rawVehicle = searchParams.vehicle as string | undefined
    const vehicleType = rawVehicle === "motorcycle" || rawVehicle === "moped" ? rawVehicle : "car"

    const [data, dict, countryIndex, staffRole] = await Promise.all([
        getCountryData(iso2, params.lang),
        getDictionary(params.lang),
        getAllCountries(),
        getStaffRoleFromCookies(),
    ])

    if (!data) {
        return <ComingSoonCountry />
    }

    const indexEntry = countryIndex.find((c) => c.iso2 === data.iso2)
    const localizedName = indexEntry?.names?.[params.lang] || data.name_en

    const vehicleOverrides = data.vehicles?.[vehicleType] || {}
    const rules: TrafficRules & Partial<VehicleRules> = {
        ...data.rules,
        ...vehicleOverrides,
        speed_limits: {
            ...data.rules.speed_limits,
            ...(vehicleOverrides.speed_limits || {}),
        },
    }

    return (
        <CountryPremiumDashboard
            data={data}
            localizedName={localizedName}
            dict={dict}
            lang={params.lang}
            vehicleType={vehicleType}
            rules={rules}
        />
    )
}
