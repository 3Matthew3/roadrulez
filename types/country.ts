import type { CountrySourceEntry } from "@/types/source"

export type { CountrySourceEntry }

export interface SpeedLimits {
    urban: number
    rural: number
    motorway: number
    units: "km/h" | "mph"
    notes?: string
}

export interface AlcoholLimit {
    value: number
    unit: "‰" | "BAC"
    notes?: string
}

export interface Tolls {
    required: boolean
    type: string // "vignette" | "toll booth" | "electronic" | "mixed"
    notes?: string
}

export interface RegionalRuleHighlight {
    title: string
    description: string
    icon?: "parking" | "environment" | "mountain" | "toll" | "winter" | "chains"
    learnMoreUrl?: string
}

export interface RegionalVariation {
    region_type: "state" | "province" | "city"
    region_name: string
    /** ISO 3166-2:AT code, e.g. AT-9 for Vienna */
    region_code?: string
    /** Optional override URL for the state/city coat of arms */
    coat_of_arms_url?: string
    differences: Partial<TrafficRules>
    notes?: string
    /** Structured regional rules for accordion-style country pages. */
    highlights?: RegionalRuleHighlight[]
}

export interface TrafficRules {
    speed_limits: SpeedLimits
    alcohol_limit: AlcoholLimit
    seatbelt_rules: string
    child_seat_rules: string
    phone_usage_rules: string
    headlights_rules: string
    priority_rules: string
    tolls: Tolls
    parking_rules: string
    mandatory_equipment: string[]
    winter_rules: string
    emergency_numbers: string[]
}

export interface VehicleRules extends Partial<TrafficRules> {
    helmet_rules?: string
    lane_splitting_rules?: string
    overtaking_rules?: string
    city_traffic_rules?: string
    motorway_access?: string
    licensing_notes?: string
}

export interface CountryData {
    // Basic Info
    name_en: string
    name_local: string
    iso2: string
    iso3: string
    continent: string
    flag: string // Emoji or path
    header_images?: string[]
    drive_side: "left" | "right"

    // Rules
    rules: TrafficRules

    // Vehicle Overrides
    vehicles?: {
        [key in "car" | "motorcycle" | "moped"]?: Partial<VehicleRules>
    }

    // Notes
    summary: string
    /** Short bullet list for dashboard-style country pages (e.g. Austria). */
    quick_answer_bullets?: string[]
    /** Top fines shown on dashboard-style country pages. */
    top_fines?: CountryFineEntry[]
    /** Structured fines page content for country sub-pages. */
    traffic_fines?: CountryTrafficFinesData
    /** FAQ entries shown on dashboard-style country pages. */
    faq?: CountryFaqEntry[]
    common_traps: string[]
    idp_requirement?: string
    rental_and_idp_notes: string

    // Regional
    regional_variations?: RegionalVariation[]

    // Metadata
    last_verified: string
    status: "sample" | "verified" | "needs_review"
    data_coverage?: "high" | "medium" | "low"
    sources: string[]
    source_entries?: CountrySourceEntry[]

    // Visuals
    road_signs?: RoadSign[]
}

export interface RoadSign {
    image_url: string
    title: string
    description: string
}

export interface CountryFineEntry {
    title: string
    amount: string
}

export type FineVehicleApplicability = "car" | "motorcycle" | "moped"

export type FineConsequenceId =
    | "fine"
    | "points"
    | "license_suspension"
    | "vehicle_impound"
    | "vehicle_confiscation"
    | "court"

export type FineCategoryId =
    | "speeding"
    | "alcohol_drugs"
    | "mobile_phone"
    | "seat_belts"
    | "parking"
    | "red_light"
    | "motorcycle"
    | "moped"
    | "special_local"

export interface CountryFineConsequence {
    fine?: string
    fine_de?: string
    points?: string | number | null
    licenseSuspension?: string | null
    licenseSuspension_de?: string | null
    vehicleImpound?: boolean
    vehicleConfiscation?: boolean
    court?: boolean
}

export interface CountryFineRow {
    id: string
    /** Speed-over label, e.g. "+10 km/h" */
    speedOver?: string
    speedOver_de?: string
    label?: string
    label_de?: string
    description?: string
    description_de?: string
    consequences: CountryFineConsequence
    appliesTo: FineVehicleApplicability[]
    severe?: boolean
}

export interface CountryFineCategory {
    id: FineCategoryId
    title?: string
    title_de?: string
    description?: string
    description_de?: string
    rows: CountryFineRow[]
}

export interface CountryFineSummary {
    id: string
    title: string
    title_de?: string
    summary: string
    summary_de?: string
    maxConsequence: string
    maxConsequence_de?: string
    icon?: "speed" | "phone" | "red_light" | "alcohol"
}

export interface CountryTrafficFinesData {
    summaries: CountryFineSummary[]
    categories: CountryFineCategory[]
    relatedSourceIds?: string[]
}

export type FaqCategoryId =
    | "documents"
    | "speed_limits"
    | "vignette_tolls"
    | "fines"
    | "winter"
    | "motorcycles"
    | "rental"

export interface FaqRelatedLink {
    label: string
    label_de?: string
    /** Internal path (without lang prefix) or full URL */
    href?: string
}

export interface CountryFaqEntry {
    id?: string
    category?: FaqCategoryId
    question: string
    answer: string
    question_de?: string
    answer_de?: string
    relatedRules?: FaqRelatedLink[]
    relatedFines?: FaqRelatedLink[]
    relatedSourceIds?: string[]
}

export interface CountryIndexItem {
    name: string // default english name (fallback)
    names: {
        [key: string]: string
    }
    iso2: string
    flag: string
}

export interface CountryInlineEditContext {
    enabled: boolean
    countryCode: string
}
