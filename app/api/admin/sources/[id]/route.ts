import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { withEditorAuth } from "@/lib/auth"

const updateSourceSchema = z.object({
    title: z.string().min(1).optional(),
    url: z.string().url().optional(),
    publisher: z.string().nullable().optional(),
    publishedDate: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    moduleKey: z.string().nullable().optional(),
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withEditorAuth(async () => {
        const body = await request.json()
        const parsed = updateSourceSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
        }

        const data = parsed.data
        const source = await prisma.source.update({
            where: { id: params.id },
            data: {
                ...data,
                publishedDate:
                    data.publishedDate === null
                        ? null
                        : data.publishedDate
                          ? new Date(data.publishedDate)
                          : undefined,
            },
            include: {
                country: { select: { id: true, name: true, iso2: true, flag: true } },
            },
        })

        return NextResponse.json({ source })
    })
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withEditorAuth(async () => {
        await prisma.source.delete({ where: { id: params.id } })
        return NextResponse.json({ ok: true })
    })
}
