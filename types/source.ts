export type SourceTypeValue =
    | "GOVERNMENT"
    | "POLICE"
    | "MINISTRY"
    | "AUTOMOBILE_ASSOCIATION"
    | "LEGAL_DATABASE"
    | "SECONDARY"

export type TrustLevelValue = "PRIMARY" | "TRUSTED_SECONDARY" | "UNVERIFIED"

export type SourceCheckStatusValue = "OK" | "CHANGED" | "FAILED" | "NEEDS_REVIEW"

export type SourceReviewStatusValue = "OPEN" | "APPROVED" | "REJECTED"

export interface CountrySourceEntry {
    id: string
    title: string
    url: string
    publisher?: string | null
    publishedDate?: string | null
    sourceType: SourceTypeValue
    trustLevel: TrustLevelValue
    moduleKey?: string | null
    /** Future-friendly: multiple rule modules covered by one source */
    usageModuleKeys?: string[]
    notes?: string | null
    checkStatus?: SourceCheckStatusValue
    lastCheckedAt?: string | null
}

export interface PublicSourceListItem extends CountrySourceEntry {
    country?: {
        id: string
        name: string
        iso2: string
        flag: string | null
    } | null
}

export const SOURCE_TYPE_LABELS: Record<SourceTypeValue, string> = {
    GOVERNMENT: "Government",
    POLICE: "Police",
    MINISTRY: "Ministry",
    AUTOMOBILE_ASSOCIATION: "Automobile association",
    LEGAL_DATABASE: "Legal database",
    SECONDARY: "Secondary",
}

export const TRUST_LEVEL_LABELS: Record<TrustLevelValue, string> = {
    PRIMARY: "Primary",
    TRUSTED_SECONDARY: "Trusted secondary",
    UNVERIFIED: "Unverified",
}
