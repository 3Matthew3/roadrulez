import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { withEditorAuth } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit"
import { applyApprovedSourceReview } from "@/lib/source-review-service"

const reviewActionSchema = z.object({
    action: z.enum(["approve", "reject"]),
    adminNote: z.string().optional(),
})

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withEditorAuth(async (session) => {
        const body = await request.json()
        const parsed = reviewActionSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
        }

        const review = await prisma.sourceReview.findUnique({
            where: { id: params.id },
            include: {
                source: {
                    include: {
                        checks: { orderBy: { checkedAt: "desc" }, take: 1 },
                    },
                },
            },
        })

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 })
        }

        if (review.status !== "OPEN") {
            return NextResponse.json({ error: "Review is already closed" }, { status: 409 })
        }

        const latestCheck = review.source.checks[0]
        const newStatus = parsed.data.action === "approve" ? "APPROVED" : "REJECTED"
        let applyResult: { applied: boolean; reason?: string } | null = null

        const updated = await prisma.$transaction(async (tx) => {
            const saved = await tx.sourceReview.update({
                where: { id: review.id },
                data: {
                    status: newStatus,
                    reviewedById: session.user.id,
                    reviewedAt: new Date(),
                    adminNote: parsed.data.adminNote,
                },
                include: {
                    source: {
                        include: {
                            country: { select: { id: true, name: true, iso2: true, flag: true } },
                        },
                    },
                    reviewedBy: { select: { id: true, name: true, email: true } },
                },
            })

            await tx.source.update({
                where: { id: review.sourceId },
                data: {
                    checkStatus: "OK",
                    contentHash: latestCheck?.newHash ?? review.source.contentHash,
                },
            })

            return saved
        })

        if (parsed.data.action === "approve") {
            applyResult = await applyApprovedSourceReview({
                reviewId: review.id,
                actorUserId: session.user.id,
            })
        }

        await createAuditLog({
            actorUserId: session.user.id,
            entityType: "source_review",
            entityId: review.id,
            action: "status_change",
            beforeValue: { status: review.status },
            afterValue: { status: newStatus },
            note: parsed.data.adminNote ?? `Source review ${parsed.data.action}d`,
        })

        return NextResponse.json({ review: updated, applyResult })
    })
}
