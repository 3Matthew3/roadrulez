/**
 * Middleware — Edge Runtime compatible.
 * Auth.js v5: export `auth` as the default middleware, using `authorized`
 * callback for admin RBAC, plus locale redirect logic.
 */
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/constants";

const locales = SUPPORTED_LOCALES;
const defaultLocale = DEFAULT_LOCALE;

const ADMIN_ROLES = ["ADMIN", "EDITOR"] as const;

const { auth } = NextAuth(authConfig);

export default auth(function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const session = req.auth;

    // ── Admin route protection ──────────────────────────────────────────────
    const isAdminPage = pathname.startsWith("/admin");
    const isAdminApi = pathname.startsWith("/api/admin");

    if (isAdminPage || isAdminApi) {
        if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
            return NextResponse.next();
        }

        const role = (session?.user as any)?.role as string | undefined;
        const hasAccess = !!session?.user && !!role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);

        if (!hasAccess) {
            if (isAdminApi) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(
                new URL(`/admin/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
            );
        }

        return NextResponse.next();
    }

    // ── Locale routing for public site ─────────────────────────────────────
    if (
        pathname.startsWith("/_next") ||
        pathname.includes(".") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/admin")
    ) {
        return NextResponse.next();
    }

    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
        const localeCookie = req.cookies.get("NEXT_LOCALE")?.value;
        let locale: Locale = defaultLocale;

        if (localeCookie && isValidLocale(localeCookie)) {
            locale = localeCookie;
        } else {
            const acceptLanguage = req.headers.get("Accept-Language");
            if (acceptLanguage?.includes("de")) {
                locale = "de";
            }
        }

        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, req.url)
        );
    }
});

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};
