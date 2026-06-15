import type {
    CountryData,
    CountryFineCategory,
    CountryTrafficFinesData,
    RegionalVariation,
    TrafficRules,
} from "@/types/country"

type WithOptionalId = { id?: string }

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value)
}

/** Deep-merge plain objects; undefined keys in override are skipped. Arrays replace wholesale. */
export function mergeDefinedRecords<T extends Record<string, unknown>>(
    base: T,
    override: Partial<T>
): T {
    const result = { ...base }

    for (const key of Object.keys(override) as (keyof T)[]) {
        const overrideValue = override[key]
        if (overrideValue === undefined) continue

        const baseValue = base[key]
        if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
            result[key] = mergeDefinedRecords(
                baseValue as Record<string, unknown>,
                overrideValue as Record<string, unknown>
            ) as T[keyof T]
            continue
        }

        result[key] = overrideValue as T[keyof T]
    }

    return result
}

function getItemId(item: WithOptionalId, getKey?: (item: WithOptionalId) => string | undefined): string | undefined {
    if (getKey) return getKey(item)
    return typeof item.id === "string" && item.id.length > 0 ? item.id : undefined
}

function shouldMergeArrayById<T extends WithOptionalId>(
    base: T[] | undefined,
    override: T[],
    getKey?: (item: WithOptionalId) => string | undefined
): boolean {
    if (!base?.length) return false
    return (
        override.every((item) => Boolean(getItemId(item, getKey))) &&
        base.every((item) => Boolean(getItemId(item, getKey)))
    )
}

/**
 * Arrays whose items carry stable ids merge entry-by-entry.
 * Arrays without ids (or mixed ids) are replaced entirely when override is present.
 */
export function mergeIdArray<T extends WithOptionalId>(
    base: T[] | undefined,
    override: T[] | undefined,
    mergeItem: (baseItem: T, overrideItem: T) => T = (baseItem, overrideItem) =>
        mergeDefinedRecords(
            baseItem as Record<string, unknown>,
            overrideItem as Record<string, unknown>
        ) as T,
    getKey?: (item: WithOptionalId) => string | undefined
): T[] | undefined {
    if (override === undefined) return base
    if (override.length === 0) return override

    if (!shouldMergeArrayById(base, override, getKey)) {
        return override
    }

    const baseList = base ?? []
    const overrideById = new Map<string, T>()
    for (const item of override) {
        const id = getItemId(item, getKey)!
        overrideById.set(id, item)
    }

    const merged: T[] = []
    const seen = new Set<string>()

    for (const item of baseList) {
        const id = getItemId(item, getKey)!
        seen.add(id)
        merged.push(overrideById.has(id) ? mergeItem(item, overrideById.get(id)!) : item)
    }

    for (const item of override) {
        const id = getItemId(item, getKey)!
        if (!seen.has(id)) {
            merged.push(item)
        }
    }

    return merged
}

function mergeTrafficRules(base: TrafficRules, override?: Partial<TrafficRules>): TrafficRules {
    if (!override) return base

    return {
        ...base,
        ...override,
        speed_limits: override.speed_limits
            ? { ...base.speed_limits, ...override.speed_limits }
            : base.speed_limits,
        alcohol_limit: override.alcohol_limit
            ? { ...base.alcohol_limit, ...override.alcohol_limit }
            : base.alcohol_limit,
        tolls: override.tolls ? { ...base.tolls, ...override.tolls } : base.tolls,
        mandatory_equipment: override.mandatory_equipment ?? base.mandatory_equipment,
        emergency_numbers: override.emergency_numbers ?? base.emergency_numbers,
    }
}

function mergeTrafficFines(
    base: CountryTrafficFinesData | undefined,
    override: CountryTrafficFinesData | undefined
): CountryTrafficFinesData | undefined {
    if (!override) return base
    if (!base) return override

    return {
        ...base,
        ...override,
        summaries: mergeIdArray(base.summaries, override.summaries) ?? base.summaries,
        categories: mergeFineCategories(base.categories, override.categories) ?? base.categories,
        relatedSourceIds: override.relatedSourceIds ?? base.relatedSourceIds,
    }
}

function mergeFineCategories(
    base: CountryFineCategory[] | undefined,
    override: CountryFineCategory[] | undefined
): CountryFineCategory[] | undefined {
    const mergedCategories = mergeIdArray(base, override, (baseCategory, overrideCategory) => ({
        ...mergeDefinedRecords(
            baseCategory as unknown as Record<string, unknown>,
            overrideCategory as unknown as Record<string, unknown>
        ),
        rows: mergeIdArray(baseCategory.rows, overrideCategory.rows) ?? baseCategory.rows,
    }))

    return mergedCategories
}

function getRegionalVariationKey(variation: RegionalVariation): string | undefined {
    return variation.region_code || variation.region_name || undefined
}

function mergeRegionalVariations(
    base: RegionalVariation[] | undefined,
    override: RegionalVariation[] | undefined
): RegionalVariation[] | undefined {
    return mergeIdArray(base, override, (baseVariation, overrideVariation) => ({
        ...mergeDefinedRecords(
            baseVariation as unknown as Record<string, unknown>,
            overrideVariation as unknown as Record<string, unknown>
        ),
        differences: overrideVariation.differences
            ? (mergeDefinedRecords(
                  (baseVariation.differences ?? {}) as Record<string, unknown>,
                  overrideVariation.differences as Record<string, unknown>
              ) as RegionalVariation["differences"])
            : baseVariation.differences,
    }), getRegionalVariationKey)
}

function mergeVehicles(
    base: CountryData["vehicles"],
    override: CountryData["vehicles"]
): CountryData["vehicles"] {
    if (!override) return base
    if (!base) return override

    return {
        car: override.car
            ? mergeDefinedRecords(
                  (base.car ?? {}) as Record<string, unknown>,
                  override.car as Record<string, unknown>
              )
            : base.car,
        motorcycle: override.motorcycle
            ? mergeDefinedRecords(
                  (base.motorcycle ?? {}) as Record<string, unknown>,
                  override.motorcycle as Record<string, unknown>
              )
            : base.motorcycle,
        moped: override.moped
            ? mergeDefinedRecords(
                  (base.moped ?? {}) as Record<string, unknown>,
                  override.moped as Record<string, unknown>
              )
            : base.moped,
    }
}

/**
 * Overlay a partial locale file on top of the English base country JSON.
 * Missing locale fields keep the English value.
 */
export function mergeCountryLocale(base: CountryData, locale: Partial<CountryData>): CountryData {
    return {
        ...base,
        ...locale,
        rules: locale.rules ? mergeTrafficRules(base.rules, locale.rules) : base.rules,
        summary: locale.summary ?? base.summary,
        rental_and_idp_notes: locale.rental_and_idp_notes ?? base.rental_and_idp_notes,
        idp_requirement: locale.idp_requirement ?? base.idp_requirement,
        last_verified: locale.last_verified ?? base.last_verified,
        status: locale.status ?? base.status,
        data_coverage: locale.data_coverage ?? base.data_coverage,
        header_images: locale.header_images ?? base.header_images,
        quick_answer_bullets: locale.quick_answer_bullets ?? base.quick_answer_bullets,
        top_fines: locale.top_fines ?? base.top_fines,
        common_traps: locale.common_traps ?? base.common_traps,
        sources: locale.sources ?? base.sources,
        faq: mergeIdArray(base.faq, locale.faq),
        source_entries: mergeIdArray(base.source_entries, locale.source_entries),
        regional_variations: mergeRegionalVariations(base.regional_variations, locale.regional_variations),
        road_signs: locale.road_signs ?? base.road_signs,
        traffic_fines: mergeTrafficFines(base.traffic_fines, locale.traffic_fines),
        vehicles: mergeVehicles(base.vehicles, locale.vehicles),
    }
}
