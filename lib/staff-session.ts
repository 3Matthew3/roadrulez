import { cookies } from "next/headers"
import { getToken } from "next-auth/jwt"

/**
 * Lightweight staff role lookup for public pages (no Prisma / full auth stack).
 * Mirrors middleware JWT checks without loading lib/auth.ts on country pages.
 */
export async function getStaffRoleFromCookies(): Promise<string | undefined> {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) return undefined

    try {
        const cookieStore = cookies()
        const token = await getToken({
            req: {
                cookies: Object.fromEntries(
                    cookieStore.getAll().map((cookie) => [cookie.name, cookie.value])
                ),
            } as any,
            secret,
            secureCookie: process.env.NODE_ENV === "production",
        })

        const role = token?.role
        return typeof role === "string" ? role : undefined
    } catch (error) {
        console.error("[auth] Failed to read staff role from JWT:", error)
        return undefined
    }
}
