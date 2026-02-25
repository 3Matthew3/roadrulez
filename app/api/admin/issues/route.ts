import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withEditorAuth } from "@/lib/auth"
import { z } from "zod"

const updateIssueSchema = z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
})

export async function GET(request: NextRequest) {
    return withEditorAuth(async () => {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const priority = searchParams.get("priority")
        const countryId = searchParams.get("countryId")
        const page = parseInt(searchParams.get("page") ?? "1")
        const limit = parseInt(searchParams.get("limit") ?? "25")
        const skip = (page - 1) * limit

        const where: any = {}
        if (status) where.status = status
        if (priority) where.priority = priority
        if (countryId) where.countryId = countryId

        const [issues, total] = await Promise.all([
            prisma.issueReport.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
                include: {
                    country: { select: { id: true, name: true, iso2: true, flag: true } },
                    region: { select: { id: true, name: true } },
                },
            }),
            prisma.issueReport.count({ where }),
        ])

        return NextResponse.json({
            issues,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        })
    })
}

export async function PATCH(request: NextRequest) {
    return withEditorAuth(async () => {
        const body = await request.json()
        const { id, ...rest } = body
        if (!id) {
            return NextResponse.json({ error: "Issue ID required" }, { status: 400 })
        }

        const parsed = updateIssueSchema.safeParse(rest)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
        }

        const issue = await prisma.issueReport.update({
            where: { id },
            data: parsed.data,
        })

        return NextResponse.json(issue)
    })
}
