import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withEditorAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    return withEditorAuth(async () => {
        const status = request.nextUrl.searchParams.get("status") ?? "OPEN"

        const reviews = await prisma.sourceReview.findMany({
            where: status === "ALL" ? undefined : { status: status as any },
            include: {
                source: {
                    include: {
                        country: { select: { id: true, name: true, iso2: true, flag: true } },
                    },
                },
                reviewedBy: { select: { id: true, name: true, email: true } },
            },
            orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        })

        return NextResponse.json({ reviews })
    })
}
