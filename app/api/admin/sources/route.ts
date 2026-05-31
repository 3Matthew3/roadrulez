import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { withEditorAuth } from "@/lib/auth"

const createSourceSchema = z.object({
    countryId: z.string().optional(),
    regionId: z.string().optional(),
    moduleKey: z.string().optional(),
    title: z.string().min(1),
    url: z.string().url(),
    publisher: z.string().optional(),
    publishedDate: z.string().optional(),
    notes: z.string().optional(),
    sourceType: z.enum([
        "GOVERNMENT",
        "POLICE",
        "MINISTRY",
        "AUTOMOBILE_ASSOCIATION",
        "LEGAL_DATABASE",
        "SECONDARY",
    ]).optional(),
    trustLevel: z.enum(["PRIMARY", "TRUSTED_SECONDARY", "UNVERIFIED"]).optional(),
    active: z.boolean().optional(),
})

export async function GET() {
    return withEditorAuth(async () => {
        const sources = await prisma.source.findMany({
            include: {
                country: { select: { id: true, name: true, iso2: true, flag: true } },
                _count: { select: { reviews: true, checks: true } },
            },
            orderBy: [{ updatedAt: "desc" }],
        })

        return NextResponse.json({ sources })
    })
}

export async function POST(request: NextRequest) {
    return withEditorAuth(async () => {
        const body = await request.json()
        const parsed = createSourceSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
        }

        const data = parsed.data
        const source = await prisma.source.create({
            data: {
                countryId: data.countryId,
                regionId: data.regionId,
                moduleKey: data.moduleKey,
                title: data.title,
                url: data.url,
                publisher: data.publisher,
                publishedDate: data.publishedDate ? new Date(data.publishedDate) : undefined,
                notes: data.notes,
                sourceType: data.sourceType,
                trustLevel: data.trustLevel,
                active: data.active,
            },
            include: {
                country: { select: { id: true, name: true, iso2: true, flag: true } },
            },
        })

        return NextResponse.json({ source }, { status: 201 })
    })
}
