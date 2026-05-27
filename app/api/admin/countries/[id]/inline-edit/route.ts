import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import {
    canInlineEditCountry,
    isCountryInlineEditField,
    validateCountryInlineEditValue,
} from "@/lib/inline-edit/country-fields"
import { updateCountryInlineField } from "@/lib/inline-edit/country-service"

const inlineEditRequestSchema = z.object({
    field: z.string(),
    value: z.unknown(),
})

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await requireAuth()

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = session.user.role
    if (!canInlineEditCountry(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const parsedBody = inlineEditRequestSchema.safeParse(body)

    if (!parsedBody.success) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    if (!isCountryInlineEditField(parsedBody.data.field)) {
        return NextResponse.json({ error: "Field is not editable inline" }, { status: 400 })
    }

    const parsedValue = validateCountryInlineEditValue(parsedBody.data.field, parsedBody.data.value)
    if (!parsedValue.success) {
        return NextResponse.json({ error: parsedValue.error }, { status: 400 })
    }

    const result = await updateCountryInlineField({
        iso2: params.id,
        field: parsedBody.data.field,
        value: parsedValue.value,
        actorUserId: session.user.id,
        actorRole: role,
    })

    if (result.status === "not_found") {
        return NextResponse.json({ error: "Country not found" }, { status: 404 })
    }

    return NextResponse.json(result)
}
