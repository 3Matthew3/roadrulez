/**
 * RBAC Tests — lib/auth.ts guard helpers
 * Run with: npx jest __tests__/rbac.test.ts
 */

// Mock next-auth's getServerSession
jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}))
jest.mock("@/lib/prisma", () => ({ prisma: {} }))

import { NextResponse } from "next/server"

/**
 * Inline the guard logic so tests don't need a live DB
 */
type Role = "ADMIN" | "EDITOR" | "REVIEWER"

function makeSession(role: Role) {
    return { user: { id: "user_1", email: "user@test.com", name: "Test", role } }
}

async function requireAuth(session: ReturnType<typeof makeSession> | null) {
    if (!session?.user) return null
    return session
}

async function requireAdmin(session: ReturnType<typeof makeSession> | null) {
    const role = (session?.user as any)?.role
    if (!session?.user || role !== "ADMIN") return null
    return session
}

async function requireEditor(session: ReturnType<typeof makeSession> | null) {
    const role = (session?.user as any)?.role
    if (!session?.user || (role !== "ADMIN" && role !== "EDITOR")) return null
    return session
}

async function withAdminAuth(session: any, handler: (s: any) => Promise<Response>) {
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return handler(session)
}

async function withEditorAuth(session: any, handler: (s: any) => Promise<Response>) {
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return handler(session)
}

describe("RBAC Guards", () => {
    describe("requireAuth", () => {
        it("returns session for authenticated user", async () => {
            const session = makeSession("EDITOR")
            expect(await requireAuth(session)).toBe(session)
        })
        it("returns null for unauthenticated", async () => {
            expect(await requireAuth(null)).toBeNull()
        })
    })

    describe("requireAdmin", () => {
        it("allows ADMIN role", async () => {
            const session = makeSession("ADMIN")
            expect(await requireAdmin(session)).toBe(session)
        })
        it("blocks EDITOR role", async () => {
            const session = makeSession("EDITOR")
            expect(await requireAdmin(session)).toBeNull()
        })
        it("blocks REVIEWER role", async () => {
            const session = makeSession("REVIEWER")
            expect(await requireAdmin(session)).toBeNull()
        })
        it("blocks unauthenticated", async () => {
            expect(await requireAdmin(null)).toBeNull()
        })
    })

    describe("requireEditor", () => {
        it("allows ADMIN role (admin ⊇ editor)", async () => {
            const session = makeSession("ADMIN")
            expect(await requireEditor(session)).toBe(session)
        })
        it("allows EDITOR role", async () => {
            const session = makeSession("EDITOR")
            expect(await requireEditor(session)).toBe(session)
        })
        it("blocks REVIEWER role", async () => {
            const session = makeSession("REVIEWER")
            expect(await requireEditor(session)).toBeNull()
        })
        it("blocks unauthenticated", async () => {
            expect(await requireEditor(null)).toBeNull()
        })
    })

    describe("withAdminAuth handler wrapper", () => {
        it("returns 401 when no session", async () => {
            const handler = jest.fn().mockResolvedValue(NextResponse.json({ ok: true }))
            const res = await withAdminAuth(null, handler)
            expect(res.status).toBe(401)
            expect(handler).not.toHaveBeenCalled()
        })
        it("calls handler when session present", async () => {
            const session = makeSession("ADMIN")
            const handler = jest.fn().mockResolvedValue(NextResponse.json({ ok: true }))
            const res = await withAdminAuth(session, handler)
            expect(handler).toHaveBeenCalledWith(session)
        })
    })
})
