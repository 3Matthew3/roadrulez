import { NextResponse } from "next/server"
import { withEditorAuth } from "@/lib/auth"
import { getOpenSourceReviewCount } from "@/lib/sources"

export async function GET() {
    return withEditorAuth(async () => {
        const count = await getOpenSourceReviewCount()
        return NextResponse.json({ count })
    })
}
