import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withEditorAuth, withAdminAuth } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const updateCountrySchema = z.object({
    name: z.string().min(1).optional(),
    flag: z.string().optional(),
    drivingSide: z.enum(["LEFT", "RIGHT"]).optional(),
    summary: z.string().optional(),
    status: z.enum(["DRAFT", "VERIFIED", "PUBLISHED"]).optional(),
    verifiedStatus: z.string().optional(),
})

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withEditorAuth(async () => {
        const country = await prisma.country.findUnique({
            where: { id: params.id },
            include: {
                updatedBy: { select: { id: true, name: true, email: true } },
                verifiedBy: { select: { id: true, name: true, email: true } },
                rules: { include: { module: true }, orderBy: { moduleKey: "asc" } },
                regions: {
                    include: {
                        ruleOverrides: { include: { module: true } },
                        sources: true,
                    },
                    orderBy: { name: "asc" },
                },
                sources: { orderBy: { createdAt: "desc" } },
                issues: { orderBy: { createdAt: "desc" }, take: 20 },
                auditLogs: {
                    include: { actorUser: { select: { id: true, name: true, email: true } } },
                    orderBy: { createdAt: "desc" },
                    take: 50,
                },
                _count: { select: { rules: true, sources: true, issues: true } },
            },
        })

        if (!country) {
            return NextResponse.json({ error: "Country not found" }, { status: 404 })
        }

        return NextResponse.json(country)
    })
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withEditorAuth(async (session) => {
        const body = await request.json()
        const parsed = updateCountrySchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
        }

        const before = await prisma.country.findUnique({ where: { id: params.id } })
        if (!before) {
            return NextResponse.json({ error: "Country not found" }, { status: 404 })
        }

        const country = await prisma.country.update({
            where: { id: params.id },
            data: {
                ...parsed.data,
                updatedById: (session.user as any).id,
            },
        })

        await createAuditLog({
            actorUserId: (session.user as any).id,
            entityType: "country",
            entityId: params.id,
            action: "update",
            beforeValue: before as any,
            afterValue: parsed.data as any,
        })

        return NextResponse.json(country)
    })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withAdminAuth(async (session) => {
        const before = await prisma.country.findUnique({ where: { id: params.id } })
        if (!before) {
            return NextResponse.json({ error: "Country not found" }, { status: 404 })
        }

        await prisma.country.delete({ where: { id: params.id } })

        await createAuditLog({
            actorUserId: (session.user as any).id,
            entityType: "country",
            entityId: params.id,
            action: "delete",
            beforeValue: before as any,
        })

        return NextResponse.json({ success: true })
    })
}
