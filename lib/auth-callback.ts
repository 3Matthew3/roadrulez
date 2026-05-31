import { DEFAULT_LOCALE, isValidLocale } from "@/lib/constants"

const ADMIN_ROOT = "/admin"

const ALLOWED_ADMIN_PREFIXES = [
    "/admin/countries",
    "/admin/sources",
    "/admin/source-reviews",
    "/admin/issues",
    "/admin/analytics",
] as const

/** Common typos → correct login path */
const ADMIN_PATH_ALIASES: Record<string, string> = {
    "/admin/logon": ADMIN_ROOT,
    "/admin/signin": ADMIN_ROOT,
    "/admin/sign-in": ADMIN_ROOT,
}

function isSafeRelativePath(path: string): boolean {
    return path.startsWith("/") && !path.startsWith("//") && !path.includes("://")
}

function isAllowedAdminCallback(path: string): boolean {
    if (path === ADMIN_ROOT) return true
    return ALLOWED_ADMIN_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    )
}

function isAllowedPublicCallback(path: string): boolean {
    const segments = path.split("/").filter(Boolean)
    if (segments.length === 0) return false
    return isValidLocale(segments[0])
}

/**
 * Prevent open redirects and 404s from bad callbackUrl values (e.g. /admin/logon).
 */
export function sanitizeAuthCallbackUrl(callbackUrl: string | null | undefined): string {
    if (!callbackUrl || !isSafeRelativePath(callbackUrl)) {
        return `/${DEFAULT_LOCALE}`
    }

    const normalized = callbackUrl.split("?")[0].split("#")[0]

    if (ADMIN_PATH_ALIASES[normalized]) {
        return ADMIN_PATH_ALIASES[normalized]
    }

    if (normalized === "/admin/login" || normalized.startsWith("/admin/login/")) {
        return ADMIN_ROOT
    }

    if (normalized.startsWith("/admin")) {
        return isAllowedAdminCallback(normalized) ? callbackUrl : ADMIN_ROOT
    }

    if (isAllowedPublicCallback(normalized)) {
        return callbackUrl
    }

    return `/${DEFAULT_LOCALE}`
}
