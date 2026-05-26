import { z } from "zod"

export const INLINE_EDIT_ALLOWED_ROLES = ["ADMIN"] as const

export type CountryInlineEditInput = "text" | "textarea" | "number" | "list"

type CountryFieldTarget = {
    type: "country"
    column: "summary" | "commonTraps" | "rentalAndIdpNotes" | "idpRequirement"
}

type RuleFieldTarget = {
    type: "rule"
    moduleKey:
    | "speed_limits"
    | "alcohol_limit"
    | "mandatory_equipment"
    | "emergency_numbers"
    | "seatbelt"
    | "child_seats"
    | "phone_usage"
    | "headlights"
    | "parking"
    | "priority_rules"
    | "tolls"
    storage: "structuredValue" | "textNotes"
    path?: string[]
    vehicleType?: "car"
}

type CountryInlineEditFieldConfig = {
    label: string
    input: CountryInlineEditInput
    schema: z.ZodType<string | number | string[]>
    target: CountryFieldTarget | RuleFieldTarget
}

const trimmedText = (maxLength: number, required = false) => {
    const base = z.string().transform((value) => value.trim()).pipe(z.string().max(maxLength))
    return required ? base.pipe(z.string().min(1)) : base
}

const smallList = (maxItems: number) =>
    z
        .array(trimmedText(160, true))
        .max(maxItems)
        .transform((items) => items.filter(Boolean))

const speedLimit = z.coerce.number().finite().min(0).max(250)
const alcoholLimit = z.coerce.number().finite().min(0).max(5)

export const COUNTRY_INLINE_EDIT_FIELDS = {
    summary: {
        label: "Summary",
        input: "textarea",
        schema: trimmedText(1200, true),
        target: { type: "country", column: "summary" },
    },
    common_traps: {
        label: "Common traps",
        input: "list",
        schema: smallList(12),
        target: { type: "country", column: "commonTraps" },
    },
    rental_and_idp_notes: {
        label: "Rental and IDP notes",
        input: "textarea",
        schema: trimmedText(800),
        target: { type: "country", column: "rentalAndIdpNotes" },
    },
    idp_requirement: {
        label: "IDP requirement",
        input: "text",
        schema: trimmedText(240),
        target: { type: "country", column: "idpRequirement" },
    },
    "speed_limits.urban": {
        label: "Urban speed limit",
        input: "number",
        schema: speedLimit,
        target: { type: "rule", moduleKey: "speed_limits", storage: "structuredValue", path: ["urban"], vehicleType: "car" },
    },
    "speed_limits.rural": {
        label: "Rural speed limit",
        input: "number",
        schema: speedLimit,
        target: { type: "rule", moduleKey: "speed_limits", storage: "structuredValue", path: ["rural"], vehicleType: "car" },
    },
    "speed_limits.motorway": {
        label: "Motorway speed limit",
        input: "number",
        schema: speedLimit,
        target: { type: "rule", moduleKey: "speed_limits", storage: "structuredValue", path: ["motorway"], vehicleType: "car" },
    },
    "speed_limits.notes": {
        label: "Speed limit notes",
        input: "textarea",
        schema: trimmedText(600),
        target: { type: "rule", moduleKey: "speed_limits", storage: "textNotes", vehicleType: "car" },
    },
    "alcohol_limit.value": {
        label: "Alcohol limit",
        input: "number",
        schema: alcoholLimit,
        target: { type: "rule", moduleKey: "alcohol_limit", storage: "structuredValue", path: ["general"] },
    },
    "alcohol_limit.notes": {
        label: "Alcohol limit notes",
        input: "textarea",
        schema: trimmedText(600),
        target: { type: "rule", moduleKey: "alcohol_limit", storage: "textNotes" },
    },
    emergency_numbers: {
        label: "Emergency numbers",
        input: "list",
        schema: smallList(8),
        target: { type: "rule", moduleKey: "emergency_numbers", storage: "structuredValue", path: ["numbers"] },
    },
    mandatory_equipment: {
        label: "Mandatory equipment",
        input: "list",
        schema: smallList(20),
        target: { type: "rule", moduleKey: "mandatory_equipment", storage: "structuredValue", path: ["items"] },
    },
    seatbelt_rules: {
        label: "Seatbelt rules",
        input: "textarea",
        schema: trimmedText(500),
        target: { type: "rule", moduleKey: "seatbelt", storage: "textNotes" },
    },
    child_seat_rules: {
        label: "Child seat rules",
        input: "textarea",
        schema: trimmedText(500),
        target: { type: "rule", moduleKey: "child_seats", storage: "textNotes" },
    },
    phone_usage_rules: {
        label: "Phone usage rules",
        input: "textarea",
        schema: trimmedText(500),
        target: { type: "rule", moduleKey: "phone_usage", storage: "textNotes" },
    },
    headlights_rules: {
        label: "Headlight rules",
        input: "textarea",
        schema: trimmedText(500),
        target: { type: "rule", moduleKey: "headlights", storage: "textNotes" },
    },
    parking_rules: {
        label: "Parking rules",
        input: "textarea",
        schema: trimmedText(600),
        target: { type: "rule", moduleKey: "parking", storage: "textNotes" },
    },
    priority_rules: {
        label: "Priority rules",
        input: "textarea",
        schema: trimmedText(500),
        target: { type: "rule", moduleKey: "priority_rules", storage: "textNotes" },
    },
    "tolls.type": {
        label: "Toll type",
        input: "text",
        schema: trimmedText(80),
        target: { type: "rule", moduleKey: "tolls", storage: "structuredValue", path: ["type"] },
    },
    "tolls.notes": {
        label: "Toll notes",
        input: "textarea",
        schema: trimmedText(500),
        target: { type: "rule", moduleKey: "tolls", storage: "textNotes" },
    },
} as const satisfies Record<string, CountryInlineEditFieldConfig>

export type CountryInlineEditField = keyof typeof COUNTRY_INLINE_EDIT_FIELDS
export type CountryInlineEditValue = string | number | string[]

export function canInlineEditCountry(role?: string | null): boolean {
    return INLINE_EDIT_ALLOWED_ROLES.includes(role as (typeof INLINE_EDIT_ALLOWED_ROLES)[number])
}

export function isCountryInlineEditField(field: string): field is CountryInlineEditField {
    return Object.prototype.hasOwnProperty.call(COUNTRY_INLINE_EDIT_FIELDS, field)
}

export function validateCountryInlineEditValue(
    field: CountryInlineEditField,
    value: unknown
): { success: true; value: CountryInlineEditValue } | { success: false; error: string } {
    const result = COUNTRY_INLINE_EDIT_FIELDS[field].schema.safeParse(value)

    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0]?.message ?? "Invalid value",
        }
    }

    return { success: true, value: result.data }
}
