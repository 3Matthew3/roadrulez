import type {
    CountryFineCategory,
    CountryFineConsequence,
    CountryFineRow,
    CountryFineSummary,
    CountryTrafficFinesData,
    FineCategoryId,
    FineConsequenceId,
    FineVehicleApplicability,
} from "@/types/country"
import type { CountrySourceEntry } from "@/types/source"

export const FINE_CATEGORY_ORDER: FineCategoryId[] = [
    "speeding",
    "alcohol_drugs",
    "mobile_phone",
    "seat_belts",
    "parking",
    "red_light",
    "motorcycle",
    "moped",
    "special_local",
]

export const FINE_CATEGORY_LABEL_KEYS: Record<FineCategoryId, string> = {
    speeding: "category_speeding",
    alcohol_drugs: "category_alcohol",
    mobile_phone: "category_phone",
    seat_belts: "category_seatbelts",
    parking: "category_parking",
    red_light: "category_red_light",
    motorcycle: "category_motorcycle",
    moped: "category_moped",
    special_local: "category_special",
}

export const CONSEQUENCE_LABEL_KEYS: Record<FineConsequenceId, string> = {
    fine: "consequence_fine",
    points: "consequence_points",
    license_suspension: "consequence_suspension",
    vehicle_impound: "consequence_impound",
    vehicle_confiscation: "consequence_confiscation",
    court: "consequence_court",
}

export const VEHICLE_LABEL_KEYS: Record<FineVehicleApplicability, string> = {
    car: "applies_car",
    motorcycle: "applies_motorcycle",
    moped: "applies_moped",
}

export function resolveFineText<T extends { [key: string]: unknown }>(
    entry: T,
    lang: string,
    field: string
): string {
    const deKey = `${field}_de`
    if (lang === "de" && typeof entry[deKey] === "string" && entry[deKey]) {
        return entry[deKey] as string
    }
    const value = entry[field]
    return typeof value === "string" ? value : ""
}

export function resolveCategoryTitle(category: CountryFineCategory, lang: string) {
    return resolveFineText(category, lang, "title") || category.id
}

export function resolveCategoryDescription(category: CountryFineCategory, lang: string) {
    return resolveFineText(category, lang, "description")
}

export function resolveSummaryTitle(summary: CountryFineSummary, lang: string) {
    return resolveFineText(summary, lang, "title")
}

export function resolveSummaryText(summary: CountryFineSummary, lang: string) {
    return resolveFineText(summary, lang, "summary")
}

export function resolveSummaryMax(summary: CountryFineSummary, lang: string) {
    return resolveFineText(summary, lang, "maxConsequence")
}

export function resolveRowLabel(row: CountryFineRow, lang: string) {
    if (row.speedOver || row.speedOver_de) {
        return resolveFineText(row, lang, "speedOver")
    }
    return resolveFineText(row, lang, "label")
}

export function resolveRowDescription(row: CountryFineRow, lang: string) {
    return resolveFineText(row, lang, "description")
}

export function resolveFineAmount(consequences: CountryFineConsequence, lang: string) {
    return resolveFineText(consequences, lang, "fine")
}

export function resolveSuspension(consequences: CountryFineConsequence, lang: string) {
    const value = resolveFineText(consequences, lang, "licenseSuspension")
    return value || null
}

export function getActiveConsequences(consequences: CountryFineConsequence): FineConsequenceId[] {
    const active: FineConsequenceId[] = []
    if (consequences.fine || consequences.fine_de) active.push("fine")
    if (consequences.points !== undefined && consequences.points !== null && consequences.points !== "") {
        active.push("points")
    }
    if (consequences.licenseSuspension || consequences.licenseSuspension_de) {
        active.push("license_suspension")
    }
    if (consequences.vehicleImpound) active.push("vehicle_impound")
    if (consequences.vehicleConfiscation) active.push("vehicle_confiscation")
    if (consequences.court) active.push("court")
    return active
}

export function resolveFinesSources(
    data: CountryTrafficFinesData,
    sources: CountrySourceEntry[]
) {
    const ids = data.relatedSourceIds
    if (!ids?.length) return sources.filter((s) => s.sourceType === "GOVERNMENT" || s.sourceType === "POLICE")

    const byId = new Map(sources.map((source) => [source.id, source]))
    return ids.map((id) => byId.get(id)).filter((source): source is CountrySourceEntry => Boolean(source))
}

export function formatVerifiedMonth(date: string | undefined, lang: string) {
    if (!date) return null
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return date
    const locale = lang === "de" ? "de-AT" : lang
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(parsed)
}
