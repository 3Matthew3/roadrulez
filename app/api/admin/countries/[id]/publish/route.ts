import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withEditorAuth } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const publishSchema = z.object({
    note: z.string().optional(),
})

/** Validates a country is ready to publish */
function validateForPublish(country: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!country.name || country.name.trim() === "") {
        errors.push("Country name is required")
    }
    if (!country.iso2 || country.iso2.trim() === "") {
        errors.push("ISO2 code is required")
    }
    if (!country.summary || country.summary.trim() === "") {
        errors.push("Summary is required before publishing")
    }
    if (!country.sources || country.sources.length === 0) {
        errors.push("At least one source is required before publishing")
    }

    return { valid: errors.length === 0, errors }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withEditorAuth(async (session) => {
        const body = await request.json().catch(() => ({}))
        const parsed = publishSchema.safeParse(body)
        const note = parsed.success ? parsed.data.note : undefined

        // Load country with sources for validation
        const country = await prisma.country.findUnique({
            where: { id: params.id },
            include: { sources: true },
        })

        if (!country) {
            return NextResponse.json({ error: "Country not found" }, { status: 404 })
        }

        if (country.status === "PUBLISHED") {
            return NextResponse.json({ error: "Country is already published" }, { status: 400 })
        }

        // Validate required fields
        const { valid, errors } = validateForPublish(country)
        if (!valid) {
            return NextResponse.json(
                { error: "Publish validation failed", details: errors },
                { status: 422 }
            )
        }

        const userId = (session.user as any).id

        // Transition to PUBLISHED
        const updated = await prisma.country.update({
            where: { id: params.id },
            data: {
                status: "PUBLISHED",
                lastVerifiedAt: new Date(),
                verifiedById: userId,
                updatedById: userId,
            },
        })

        await createAuditLog({
            actorUserId: userId,
            entityType: "country",
            entityId: params.id,
            action: "publish",
            beforeValue: { status: country.status } as any,
            afterValue: { status: "PUBLISHED" } as any,
            note: note ?? `Published by ${session.user?.name ?? session.user?.email}`,
        })

        return NextResponse.json({ success: true, country: updated })
    })
}
