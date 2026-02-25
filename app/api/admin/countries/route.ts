import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withEditorAuth } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const createCountrySchema = z.object({
    name: z.string().min(1),
    iso2: z.string().length(2),
    flag: z.string().optional(),
    drivingSide: z.enum(["LEFT", "RIGHT"]).default("RIGHT"),
    summary: z.string().optional(),
})

export async function GET(request: NextRequest) {
    return withEditorAuth(async () => {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const search = searchParams.get("search")
        const drivingSide = searchParams.get("drivingSide")
        const page = parseInt(searchParams.get("page") ?? "1")
        const limit = parseInt(searchParams.get("limit") ?? "20")
        const skip = (page - 1) * limit

        const where: any = {}
        if (status) where.status = status
        if (drivingSide) where.drivingSide = drivingSide
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { iso2: { contains: search, mode: "insensitive" } },
            ]
        }

        const [countries, total] = await Promise.all([
            prisma.country.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: "asc" },
                include: {
                    updatedBy: { select: { id: true, name: true, email: true } },
                    _count: { select: { rules: true, sources: true, issues: true } },
                },
            }),
            prisma.country.count({ where }),
        ])

        return NextResponse.json({
            countries,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        })
    })
}

export async function POST(request: NextRequest) {
    return withEditorAuth(async (session) => {
        const body = await request.json()
        const parsed = createCountrySchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
        }

        const country = await prisma.country.create({
            data: {
                ...parsed.data,
                updatedById: (session.user as any).id,
            },
        })

        await createAuditLog({
            actorUserId: (session.user as any).id,
            entityType: "country",
            entityId: country.id,
            action: "create",
            afterValue: parsed.data as any,
        })

        return NextResponse.json(country, { status: 201 })
    })
}
