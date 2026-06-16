import type { CountryData } from "@/types/country"
import { isVerifiedHeaderImage, shouldReplaceHeaderImages } from "@/lib/country-header-images"
import type { CountrySeed } from "@/lib/country-seeds/helpers"
import { COUNTRY_SEEDS } from "@/lib/country-seeds/catalog"

function mergeTrafficRules(base: CountryData["rules"], override?: CountryData["rules"]) {
    if (!override) return base
    return {
        ...base,
        ...override,
        speed_limits: { ...base.speed_limits, ...override.speed_limits },
        alcohol_limit: { ...base.alcohol_limit, ...override.alcohol_limit },
        tolls: { ...base.tolls, ...override.tolls },
        mandatory_equipment: override.mandatory_equipment?.length
            ? override.mandatory_equipment
            : base.mandatory_equipment,
        emergency_numbers: override.emergency_numbers?.length
            ? override.emergency_numbers
            : base.emergency_numbers,
    }
}

/** Merge JSON file data with catalog seed — existing JSON wins for detailed fields. */
export function mergeCountryWithSeed(
    json: CountryData | null,
    seed: CountrySeed | undefined
): CountryData | null {
    if (!json && !seed) return null
    if (!seed) return json
    if (!json) return seed as CountryData

    const headerSource = shouldReplaceHeaderImages(json.header_images)
        ? seed.header_images
        : json.header_images
    const verifiedHeaders = (headerSource ?? []).filter(isVerifiedHeaderImage)
    const header_images = verifiedHeaders.length ? verifiedHeaders : seed.header_images

    return {
        ...seed,
        ...json,
        rules: mergeTrafficRules(seed.rules, json.rules),
        summary: json.summary || seed.summary,
        common_traps: json.common_traps?.length ? json.common_traps : seed.common_traps,
        quick_answer_bullets: json.quick_answer_bullets?.length
            ? json.quick_answer_bullets
            : seed.quick_answer_bullets,
        top_fines: json.top_fines?.length ? json.top_fines : seed.top_fines,
        faq: json.faq?.length ? json.faq : seed.faq,
        source_entries: json.source_entries?.length ? json.source_entries : seed.source_entries,
        sources: json.sources?.length ? json.sources : seed.sources,
        header_images,
        regional_variations: json.regional_variations?.length
            ? json.regional_variations
            : seed.regional_variations,
        traffic_fines: json.traffic_fines ?? seed.traffic_fines,
        vehicles: json.vehicles ?? seed.vehicles,
        road_signs: json.road_signs ?? seed.road_signs,
        rental_and_idp_notes: json.rental_and_idp_notes || seed.rental_and_idp_notes,
        last_verified: json.last_verified || seed.last_verified,
        status: json.status || seed.status,
        data_coverage: json.data_coverage || seed.data_coverage,
    }
}

export function getCountrySeed(iso2: string): CountrySeed | undefined {
    return COUNTRY_SEEDS[iso2.toUpperCase()]
}

export function getCatalogIndexEntries() {
    return Object.values(COUNTRY_SEEDS).map((seed) => ({
        name: seed.name_en,
        names: {
            en: seed.indexNames?.en ?? seed.name_en,
            de: seed.indexNames?.de ?? seed.name_local,
            es: seed.indexNames?.es ?? seed.name_en,
            ja: seed.indexNames?.ja ?? seed.name_en,
        },
        iso2: seed.iso2,
        flag: seed.flag,
    }))
}
