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

export interface RegionalVariation {
    region_type: "state" | "province" | "city"
    region_name: string
    region_code?: string
    differences: Partial<TrafficRules>
    notes?: string
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
    common_traps: string[]
    rental_and_idp_notes: string

    // Regional
    regional_variations?: RegionalVariation[]

    // Metadata
    last_verified: string
    status: "sample" | "verified" | "needs_review"
    data_coverage?: "high" | "medium" | "low"
    sources: string[]

    // Visuals
    road_signs?: RoadSign[]
}

export interface RoadSign {
    image_url: string
    title: string
    description: string
}

export interface CountryIndexItem {
    name: string // default english name (fallback)
    names: {
        [key: string]: string
    }
    iso2: string
    flag: string
}
