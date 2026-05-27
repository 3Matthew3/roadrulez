import { Prisma } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import {
    COUNTRY_INLINE_EDIT_FIELDS,
    CountryInlineEditField,
    CountryInlineEditValue,
} from "@/lib/inline-edit/country-fields"

type RuleModuleMetadata = {
    name: string
    description: string
    schemaHint: Record<string, string>
}

type InlineRuleTarget = Extract<(typeof COUNTRY_INLINE_EDIT_FIELDS)[CountryInlineEditField]["target"], { type: "rule" }>

const RULE_MODULE_METADATA: Record<string, RuleModuleMetadata> = {
    speed_limits: {
        name: "Speed Limits",
        description: "Urban, rural, motorway speed limits",
        schemaHint: { urban: "number", rural: "number", motorway: "number", units: "string", notes: "string" },
    },
    alcohol_limit: {
        name: "Alcohol Limit",
        description: "Blood alcohol content limits",
        schemaHint: { general: "number", notes: "string" },
    },
    mandatory_equipment: {
        name: "Mandatory Equipment",
        description: "Required items in vehicle",
        schemaHint: { items: "string[]" },
    },
    emergency_numbers: {
        name: "Emergency Numbers",
        description: "Emergency contact numbers",
        schemaHint: { numbers: "string[]" },
    },
    seatbelt: {
        name: "Seatbelt Rules",
        description: "Seatbelt requirements",
        schemaHint: { notes: "string" },
    },
    child_seats: {
        name: "Child Seats",
        description: "Child restraint requirements",
        schemaHint: { notes: "string" },
    },
    phone_usage: {
        name: "Phone Usage",
        description: "Rules on mobile phone use while driving",
        schemaHint: { notes: "string" },
    },
    headlights: {
        name: "Headlights",
        description: "Headlight requirements",
        schemaHint: { notes: "string" },
    },
    parking: {
        name: "Parking Rules",
        description: "Parking regulations",
        schemaHint: { notes: "string" },
    },
    priority_rules: {
        name: "Priority Rules",
        description: "Right-of-way and priority rules",
        schemaHint: { notes: "string" },
    },
    tolls: {
        name: "Tolls",
        description: "Toll systems",
        schemaHint: { type: "string", notes: "string" },
    },
}

function toJsonObject(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return { ...(value as Record<string, unknown>) }
    }

    return {}
}

function getPathValue(source: Record<string, unknown>, path: string[] | undefined): unknown {
    if (!path) return undefined

    return path.reduce<unknown>((current, segment) => {
        if (!current || typeof current !== "object" || Array.isArray(current)) return undefined
        return (current as Record<string, unknown>)[segment]
    }, source)
}

function setPathValue(source: Record<string, unknown>, path: string[], value: CountryInlineEditValue) {
    let target = source

    for (const segment of path.slice(0, -1)) {
        const next = target[segment]
        if (!next || typeof next !== "object" || Array.isArray(next)) {
            target[segment] = {}
        }
        target = target[segment] as Record<string, unknown>
    }

    target[path[path.length - 1]] = value
}

function normalizeValue(value: unknown): CountryInlineEditValue {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string")
    }

    if (typeof value === "number") return value
    if (typeof value === "string") return value

    return ""
}

function valuesEqual(a: CountryInlineEditValue, b: CountryInlineEditValue): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
}

function getVehicleType(target: InlineRuleTarget): "car" | undefined {
    return "vehicleType" in target ? target.vehicleType : undefined
}

async function ensureRuleModule(moduleKey: string) {
    const metadata = RULE_MODULE_METADATA[moduleKey] ?? {
        name: moduleKey.replace(/_/g, " "),
        description: "Inline editable country rule",
        schemaHint: { notes: "string" },
    }

    await prisma.ruleModule.upsert({
        where: { key: moduleKey },
        update: {},
        create: {
            key: moduleKey,
            name: metadata.name,
            description: metadata.description,
            schemaHint: metadata.schemaHint,
        },
    })
}

async function findEditableRule(countryId: string, moduleKey: string, vehicleType?: "car") {
    const rules = await prisma.countryRule.findMany({
        where: { countryId, moduleKey },
        orderBy: { updatedAt: "desc" },
    })

    if (vehicleType) {
        return (
            rules.find((rule) => rule.vehicleType === vehicleType) ??
            rules.find((rule) => rule.vehicleType === null || rule.vehicleType === "") ??
            null
        )
    }

    return (
        rules.find((rule) => rule.vehicleType === null || rule.vehicleType === "") ??
        rules[0] ??
        null
    )
}

export async function updateCountryInlineField({
    iso2,
    field,
    value,
    actorUserId,
    actorRole,
}: {
    iso2: string
    field: CountryInlineEditField
    value: CountryInlineEditValue
    actorUserId: string
    actorRole: string
}) {
    const config = COUNTRY_INLINE_EDIT_FIELDS[field]
    const country = await prisma.country.findUnique({
        where: { iso2: iso2.toUpperCase() },
        select: {
            id: true,
            iso2: true,
            summary: true,
            commonTraps: true,
            rentalAndIdpNotes: true,
            idpRequirement: true,
        },
    })

    if (!country) {
        return { status: "not_found" as const }
    }

    let oldValue: CountryInlineEditValue

    if (config.target.type === "country") {
        oldValue = normalizeValue(country[config.target.column as keyof typeof country])

        if (!valuesEqual(oldValue, value)) {
            await prisma.country.update({
                where: { id: country.id },
                data: {
                    [config.target.column]: value,
                    updatedById: actorUserId,
                },
            })
        }
    } else {
        await ensureRuleModule(config.target.moduleKey)

        const vehicleType = getVehicleType(config.target)
        const rule = await findEditableRule(country.id, config.target.moduleKey, vehicleType)
        const structuredValue = toJsonObject(rule?.structuredValue)
        oldValue =
            config.target.storage === "textNotes"
                ? normalizeValue(rule?.textNotes ?? (field.endsWith(".notes") ? getPathValue(structuredValue, ["notes"]) : ""))
                : normalizeValue(getPathValue(structuredValue, config.target.path))

        if (!valuesEqual(oldValue, value)) {
            if (rule) {
                await prisma.countryRule.update({
                    where: { id: rule.id },
                    data: buildRuleUpdateData(config.target, structuredValue, value),
                })
            } else {
                await prisma.countryRule.create({
                    data: {
                        countryId: country.id,
                        moduleKey: config.target.moduleKey,
                        vehicleType: vehicleType ?? null,
                        ...buildRuleUpdateData(config.target, {}, value),
                    },
                })
            }

            await prisma.country.update({
                where: { id: country.id },
                data: { updatedById: actorUserId },
            })
        }
    }

    if (!valuesEqual(oldValue, value)) {
        await createAuditLog({
            actorUserId,
            entityType: "country",
            entityId: country.id,
            action: "update",
            beforeValue: {
                countryId: country.id,
                field,
                userRole: actorRole,
                value: oldValue as any,
            },
            afterValue: {
                countryId: country.id,
                field,
                userRole: actorRole,
                value: value as any,
            },
            note: `Inline edit: ${field}`,
        })
    }

    return {
        status: "ok" as const,
        countryId: country.id,
        field,
        value,
        changed: !valuesEqual(oldValue, value),
    }
}

function buildRuleUpdateData(
    target: InlineRuleTarget,
    currentStructuredValue: Record<string, unknown>,
    value: CountryInlineEditValue
) {
    if (target.storage === "textNotes") {
        return { textNotes: value as string }
    }

    const nextStructuredValue = { ...currentStructuredValue }
    if (target.path) {
        setPathValue(nextStructuredValue, target.path, value)
    }

    return { structuredValue: nextStructuredValue as Prisma.InputJsonObject }
}
