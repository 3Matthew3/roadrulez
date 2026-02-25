import { ComingSoonCountry } from "@/components/coming-soon-country"
import { getCountryData, getAllCountries } from "@/lib/countries"
import RegionSelector from "@/components/country/region-selector"
import VehicleSpecificsCard from "@/components/country/vehicle-specifics-card"
import FeedbackForm from "@/components/country/feedback-form"
import { getDictionary } from "@/lib/dictionaries"
import { VehicleRules, TrafficRules } from "@/types/country"
import { Triangle } from "lucide-react"
import { CountryViewTracker } from "@/components/country-view-tracker"

// Modular Components
import CountryHero from "@/components/country/modular/CountryHero"
import QuickSummary from "@/components/country/modular/QuickSummary"
import RequirementsCard from "@/components/country/modular/RequirementsCard"
import SpeedLimitsCard from "@/components/country/modular/SpeedLimitsCard"
import AlcoholLimitCard from "@/components/country/modular/AlcoholLimitCard"
import EmergencyCard from "@/components/country/modular/EmergencyCard"
import TollsCard from "@/components/country/modular/TollsCard"
import DrivingBasics from "@/components/country/modular/DrivingBasics"
import DetailedRulesAccordion from "@/components/country/modular/DetailedRulesAccordion"
import ChecklistCard from "@/components/country/modular/ChecklistCard"
import TrafficSignsGrid from "@/components/country/modular/TrafficSignsGrid"

interface PageProps {
    params: {
        code: string   // ISO2 code, e.g. "DE", "JP"
        lang: string
    }
    searchParams: {
        vehicle?: string
    }
}

export default async function CountryPage({ params, searchParams }: PageProps) {
    // Normalise to uppercase — URL may come in as /country/de or /country/DE
    const iso2 = params.code.toUpperCase()
    const rawVehicle = searchParams.vehicle as string | undefined
    const vehicleType = (rawVehicle === "motorcycle" || rawVehicle === "moped") ? rawVehicle : "car"

    // Parallel data loading — direct ISO2 lookup, no name resolution needed
    const [data, dict, countryIndex] = await Promise.all([
        getCountryData(iso2, params.lang),
        getDictionary(params.lang),
        getAllCountries()
    ])

    if (!data) {
        return <ComingSoonCountry />
    }

    // Find localized name from index
    const indexEntry = countryIndex.find(c => c.iso2 === data.iso2)
    const localizedName = indexEntry?.names?.[params.lang] || data.name_en

    // Merge vehicle-specific rules on top of the national defaults
    const vehicleOverrides = data.vehicles?.[vehicleType] || {}
    const rules: TrafficRules & Partial<VehicleRules> = {
        ...data.rules,
        ...vehicleOverrides,
        speed_limits: {
            ...data.rules.speed_limits,
            ...(vehicleOverrides.speed_limits || {})
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0e17] text-slate-200">
            {/* Fire country_view event to Plausible */}
            <CountryViewTracker iso2={data.iso2} />
            <CountryHero
                data={data}
                localizedName={localizedName}
                dict={dict}
                vehicleType={vehicleType}
            />

            <div className="container px-4 md:px-6 py-8 space-y-8">

                {/* Vehicle Specifics Card (if applicable) */}
                {vehicleType !== 'car' && (
                    <VehicleSpecificsCard
                        vehicleType={vehicleType}
                        rules={rules}
                        labels={dict}
                    />
                )}

                <QuickSummary data={data} dict={dict} />
                <RequirementsCard data={data} dict={dict} />

                <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <Triangle className="h-4 w-4" />
                    <p>{dict.common.disclaimer}</p>
                </div>

                {/* Rules Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <SpeedLimitsCard rules={rules} status={data.status} dict={dict} />
                    <AlcoholLimitCard rules={rules} dict={dict} />
                    <EmergencyCard rules={rules} dict={dict} />
                    <TollsCard rules={rules} dict={dict} />
                </div>

                <DrivingBasics data={data} rules={rules} dict={dict} />

                <div className="grid md:grid-cols-2 gap-8">
                    <DetailedRulesAccordion rules={rules} dict={dict} />
                    <ChecklistCard data={data} rules={rules} dict={dict} />
                </div>

                <TrafficSignsGrid data={data} dict={dict} />

                {/* Regional Logic */}
                {
                    data.regional_variations && data.regional_variations.length > 0 && (
                        <RegionSelector variations={data.regional_variations} />
                    )
                }

                {/* Feedback Form */}
                <div className="pt-8 border-t border-slate-800">
                    <FeedbackForm labels={dict.extra} countryName={data.name_en} />
                </div>

            </div >
        </div >
    )
}
