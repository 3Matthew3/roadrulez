import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import type { SourceSuggestion } from "@/lib/source-patterns"

export async function getCurrentFieldValue(
    countryId: string,
    suggestion: Pick<SourceSuggestion, "moduleKey" | "fieldName">
): Promise<string | null> {
    if (suggestion.moduleKey === "idp_requirement" || suggestion.fieldName === "idpRequirement") {
        const country = await prisma.country.findUnique({
            where: { id: countryId },
            select: { idpRequirement: true },
        })
        return country?.idpRequirement ?? null
    }

    const rule = await prisma.countryRule.findFirst({
        where: {
            countryId,
            moduleKey: suggestion.moduleKey,
            OR: [{ vehicleType: null }, { vehicleType: "" }],
        },
        orderBy: { updatedAt: "desc" },
    })

    if (!rule?.structuredValue) return null
    return JSON.stringify(rule.structuredValue)
}

async function ensureRuleModule(moduleKey: string) {
    await prisma.ruleModule.upsert({
        where: { key: moduleKey },
        update: {},
        create: {
            key: moduleKey,
            name: moduleKey.replace(/_/g, " "),
            description: "Updated from approved source review",
        },
    })
}

export async function applyApprovedSourceReview({
    reviewId,
    actorUserId,
}: {
    reviewId: string
    actorUserId: string
}): Promise<{ applied: boolean; reason?: string }> {
    const review = await prisma.sourceReview.findUnique({
        where: { id: reviewId },
        include: {
            source: { include: { country: true } },
        },
    })

    if (!review?.countryId || !review.moduleKey || !review.suggestedValue) {
        return { applied: false, reason: "No structured suggestion to apply" }
    }

    const countryId = review.countryId

    if (review.moduleKey === "idp_requirement" || review.fieldName === "idpRequirement") {
        const country = review.source.country
        if (!country) return { applied: false, reason: "Country not found" }

        await prisma.country.update({
            where: { id: country.id },
            data: {
                idpRequirement: review.suggestedValue,
                updatedById: actorUserId,
            },
        })

        await createAuditLog({
            actorUserId,
            entityType: "country",
            entityId: country.id,
            action: "update",
            beforeValue: { idpRequirement: country.idpRequirement ?? null },
            afterValue: { idpRequirement: review.suggestedValue },
            note: `Applied approved source review ${review.id}`,
        })

        return { applied: true }
    }

    if (review.fieldName !== "structuredValue") {
        return { applied: false, reason: "Unsupported field for auto-apply" }
    }

    let parsedValue: Record<string, unknown>
    try {
        parsedValue = JSON.parse(review.suggestedValue) as Record<string, unknown>
    } catch {
        return { applied: false, reason: "Suggested value is not valid JSON" }
    }

    await ensureRuleModule(review.moduleKey)

    const existingRule = await prisma.countryRule.findFirst({
        where: {
            countryId,
            moduleKey: review.moduleKey,
            OR: [{ vehicleType: null }, { vehicleType: "" }],
        },
        orderBy: { updatedAt: "desc" },
    })

    const beforeValue = existingRule?.structuredValue ?? null

    if (existingRule) {
        await prisma.countryRule.update({
            where: { id: existingRule.id },
            data: {
                structuredValue: parsedValue as Prisma.InputJsonObject,
            },
        })
    } else {
        await prisma.countryRule.create({
            data: {
                countryId,
                moduleKey: review.moduleKey,
                structuredValue: parsedValue as Prisma.InputJsonObject,
            },
        })
    }

    await prisma.country.update({
        where: { id: countryId },
        data: { updatedById: actorUserId },
    })

    await createAuditLog({
        actorUserId,
        entityType: "country_rule",
        entityId: countryId,
        action: "update",
        beforeValue: { moduleKey: review.moduleKey, structuredValue: beforeValue as any },
        afterValue: { moduleKey: review.moduleKey, structuredValue: parsedValue as any },
        note: `Applied approved source review ${review.id}`,
    })

    return { applied: true }
}
