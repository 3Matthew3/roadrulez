import { notFound } from "next/navigation"
import { getCountryByName, getAllCountries } from "@/lib/countries"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, Car, Info, Phone, Siren, ThermometerSnowflake, Triangle, CheckSquare, Square } from "lucide-react"
import RegionSelector from "@/components/country/region-selector"
import HeroImage from "@/components/country/hero-image"
import VehicleSwitcher from "@/components/country/vehicle-switcher"
import VehicleSpecificsCard from "@/components/country/vehicle-specifics-card"
import FeedbackForm from "@/components/country/feedback-form"
import { getDictionary } from "@/lib/dictionaries"
import { VehicleRules, TrafficRules } from "@/types/country"

interface PageProps {
    params: {
        name: string
        lang: string
    }
    searchParams: {
        vehicle?: string
    }
}

// Helper for speed conversion
function convertSpeed(value: number, unit: "km/h" | "mph"): string {
    if (unit === "mph") {
        // mph to km/h (approx 1.61) -> round to nearest 5 for cleaner look typically, or just integer
        return `${Math.round(value * 1.60934)} km/h`
    } else {
        // km/h to mph (approx 0.62)
        return `${Math.round(value * 0.621371)} mph`
    }
}

export default async function CountryPage({ params, searchParams }: PageProps) {
    const countryName = decodeURIComponent(params.name)
    const rawVehicle = searchParams.vehicle as string | undefined
    const vehicleType = (rawVehicle === "motorcycle" || rawVehicle === "moped") ? rawVehicle : "car"

    // Parallel data loading
    const [data, dict, countryIndex] = await Promise.all([
        // Note: getCountryByName now supports locale, which might load a localized JSON if it exists (e.g. jp.de.json)
        // However, many countries only have English JSON (th.json).
        // We still need the localized NAME from the index.
        getCountryByName(countryName, params.lang),
        getDictionary(params.lang),
        getAllCountries()
    ])

    if (!data) {
        return notFound()
    }

    // Find localized name from index
    const indexEntry = countryIndex.find(c => c.iso2 === data.iso2)
    const localizedName = indexEntry?.names?.[params.lang] || data.name_en

    // Merge logic
    const vehicleOverrides = data.vehicles?.[vehicleType] || {}
    const rules: TrafficRules & Partial<VehicleRules> = {
        // ...
        ...data.rules,
        ...vehicleOverrides,
        speed_limits: {
            ...data.rules.speed_limits,
            ...(vehicleOverrides.speed_limits || {})
        }
    }

    const driveSideLabel = data.drive_side === 'right' ? dict.common.right : dict.common.left

    return (
        <div className="min-h-screen bg-[#0a0e17] text-slate-200">
            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-[#111] z-0">
                    <HeroImage name={data.name_en} images={data.header_images} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/60 to-transparent z-10" />
                </div>

                <div className="container relative z-20 h-full flex flex-col justify-end pb-12 px-8 md:px-10">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="relative h-16 w-24 md:h-20 md:w-32 shadow-lg rounded-lg overflow-hidden border border-slate-700/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://flagcdn.com/w320/${data.iso2.toLowerCase()}.png`}
                                alt={`${localizedName} flag`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{localizedName}</h1>
                            <div className="flex items-center gap-2 text-slate-400 mt-2">
                                <Info className="h-4 w-4 text-blue-400" />
                                <span>{dict.props.drive_side}: <span className="text-white font-semibold capitalize">{driveSideLabel}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* ... stats badges ... */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs text-slate-500 font-mono">
                        <VehicleSwitcher
                            currentVehicle={vehicleType}
                            labels={dict.vehicle}
                        />
                        <div className="flex items-center gap-4">
                            <span>{dict.common.last_verified}: {data.last_verified}</span>
                            <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10 uppercase text-[10px]">
                                {data.status}
                            </Badge>
                            {data.data_coverage && (
                                <Badge variant="outline" className={`uppercase text-[10px] ${data.data_coverage === 'high' ? 'text-green-400 border-green-500/20 bg-green-500/10' :
                                    data.data_coverage === 'medium' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' :
                                        'text-slate-400 border-slate-500/20 bg-slate-500/10'
                                    }`}>
                                    {dict.extra.data_coverage}: {data.data_coverage}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 md:px-6 py-8 space-y-8">

                {/* Vehicle Specifics Card (if applicable) */}
                {vehicleType !== 'car' && (
                    <VehicleSpecificsCard
                        vehicleType={vehicleType}
                        rules={rules}
                        labels={dict}
                    />
                )}

                {/* Quick Summary Glass Card */}
                <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Info className="h-32 w-32 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-400" />
                        {dict.common.summary}
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-lg mb-4">
                        {data.summary}
                    </p>
                    <ul className="space-y-2">
                        {data.common_traps.map((trap, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-400">
                                <span className="text-blue-500 mt-1.5">•</span>
                                {trap}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex items-center gap-2 text-amber-500/80 text-sm bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                    <Triangle className="h-4 w-4" />
                    <p>{dict.common.disclaimer}</p>
                </div>

                {/* Rules Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Speed Limits */}
                    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
                        <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                            <Car className="h-5 w-5" /> {dict.rules.speed_limits} <span className="text-xs text-slate-500 font-normal">({data.status})</span>
                        </h3>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex justify-between border-b border-slate-800 pb-2">
                                <span>{dict.rules.urban}</span>
                                <span className="font-bold text-white">
                                    {rules.speed_limits.urban} <span className="text-sm font-normal text-slate-500">{rules.speed_limits.units}</span>
                                    <span className="text-xs text-slate-500 ml-1 font-normal">
                                        ({convertSpeed(rules.speed_limits.urban, rules.speed_limits.units)})
                                    </span>
                                </span>
                            </li>
                            <li className="flex justify-between border-b border-slate-800 pb-2">
                                <span>{dict.rules.rural}</span>
                                <span className="font-bold text-white">
                                    {rules.speed_limits.rural} <span className="text-sm font-normal text-slate-500">{rules.speed_limits.units}</span>
                                    <span className="text-xs text-slate-500 ml-1 font-normal">
                                        ({convertSpeed(rules.speed_limits.rural, rules.speed_limits.units)})
                                    </span>
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span>{dict.rules.motorway}</span>
                                <span className="font-bold text-white">
                                    {rules.speed_limits.motorway} <span className="text-sm font-normal text-slate-500">{rules.speed_limits.units}</span>
                                    <span className="text-xs text-slate-500 ml-1 font-normal">
                                        ({convertSpeed(rules.speed_limits.motorway, rules.speed_limits.units)})
                                    </span>
                                </span>
                            </li>
                        </ul>
                        {rules.speed_limits.notes && (
                            <p className="text-xs text-slate-500 mt-4 italic">
                                {rules.speed_limits.notes}
                            </p>
                        )}
                    </div>

                    {/* Alcohol */}
                    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
                        <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                            <ThermometerSnowflake className="h-5 w-5" /> {dict.rules.alcohol_limit}
                        </h3>
                        <div className="mb-4">
                            <div className="text-3xl font-bold text-white mb-1">
                                {rules.alcohol_limit.value} <span className="text-base font-normal text-slate-400">{rules.alcohol_limit.unit}</span>
                            </div>
                        </div>
                        {rules.alcohol_limit.notes && (
                            <p className="text-sm text-slate-400">
                                {rules.alcohol_limit.notes}
                            </p>
                        )}
                    </div>

                    {/* Emergency */}
                    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
                        <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                            <Siren className="h-5 w-5" /> {dict.rules.emergency}
                        </h3>
                        <ul className="space-y-3">
                            {rules.emergency_numbers.map((num, i) => (
                                <li key={i} className="flex flex-col">
                                    <span className="text-2xl font-bold text-white">{num.split(' ')[0]}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">{num.split(' ').slice(1).join(' ').replace(/[()]/g, '')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tolls */}
                    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
                        <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                            <Car className="h-5 w-5" /> {dict.rules.tolls}
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">Required:</span>
                                <span className={rules.tolls.required ? "text-amber-400 font-medium" : "text-green-400 font-medium"}>
                                    {rules.tolls.required ? "Yes" : "No"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <span className="text-slate-400">Type:</span>
                                <span className="capitalize">{rules.tolls.type}</span>
                            </div>
                            {rules.tolls.notes && (
                                <p className="text-sm text-slate-500 mt-2 bg-slate-800/50 p-2 rounded">
                                    Tip: {rules.tolls.notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Advanced Details Accordion */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white">{dict.rules.detailed_rules}</h3>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="basics" className="border-slate-800">
                                <AccordionTrigger className="text-slate-200 hover:text-white">{dict.rules.driving_basics}</AccordionTrigger>
                                <AccordionContent className="text-slate-400 space-y-2">
                                    <p><strong className="text-slate-300">{dict.props.drive_side}:</strong> {data.drive_side}.</p>
                                    <p><strong className="text-slate-300">{dict.props.seatbelts}:</strong> {rules.seatbelt_rules}</p>
                                    <p><strong className="text-slate-300">{dict.props.child_seats}:</strong> {rules.child_seat_rules}</p>
                                    <p><strong className="text-slate-300">{dict.props.priority}:</strong> {rules.priority_rules}</p>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="phone" className="border-slate-800">
                                <AccordionTrigger className="text-slate-200 hover:text-white">{dict.rules.phone_distractions}</AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                    {rules.phone_usage_rules}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="lights" className="border-slate-800">
                                <AccordionTrigger className="text-slate-200 hover:text-white">{dict.rules.lights_parking}</AccordionTrigger>
                                <AccordionContent className="text-slate-400 space-y-2">
                                    <p><strong className="text-slate-300">{dict.props.headlights}:</strong> {rules.headlights_rules}</p>
                                    <p><strong className="text-slate-300">{dict.props.parking}:</strong> {rules.parking_rules}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white">{dict.rules.checklist}</h3>
                        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6">
                            <h4 className="font-medium text-white mb-4">{dict.rules.mandatory_equipment}</h4>
                            {rules.mandatory_equipment.length > 0 ? (
                                <ul className="space-y-3">
                                    {rules.mandatory_equipment.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300">
                                            <Square className="h-5 w-5 text-slate-600" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 text-sm">No specific equipment listed.</p>
                            )}
                        </div>

                        <div className="rounded-xl border border-slate-800 p-6">
                            <h4 className="font-medium text-white mb-2">{dict.rules.sources}</h4>
                            <ul className="space-y-1 text-sm text-slate-500">
                                {data.sources.length > 0 ? data.sources.map((s, i) => (
                                    <li key={i}>{s}</li>
                                )) : (
                                    <li>Official Highway Code</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>


                {/* Road Signs */}
                {data.road_signs && data.road_signs.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white">{dict.extra.road_signs}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {data.road_signs.map((sign, i) => (
                                <div key={i} className="group relative rounded-xl bg-slate-900/50 border border-slate-800 p-4 flex flex-col items-center text-center hover:bg-slate-800/50 transition-colors">
                                    <div className="h-24 w-24 mb-3 relative">
                                        <img src={sign.image_url} alt={sign.title} className="h-full w-full object-contain" />
                                    </div>
                                    <span className="font-medium text-white mb-1">{sign.title}</span>
                                    <span className="text-xs text-slate-500 leading-tight">{sign.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
