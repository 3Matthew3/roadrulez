import { NextRequest, NextResponse } from "next/server"
import { runSourceCheckJob } from "@/lib/source-check"

function isAuthorized(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) return false

    const authHeader = request.headers.get("authorization")
    if (authHeader === `Bearer ${cronSecret}`) return true

    // Vercel Cron sends this header automatically
    return request.headers.get("x-vercel-cron") === "1" && !!cronSecret
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const result = await runSourceCheckJob()
        return NextResponse.json({ ok: true, ...result })
    } catch (error) {
        console.error("[CRON] source-check failed:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Source check failed" },
            { status: 500 }
        )
    }
}
