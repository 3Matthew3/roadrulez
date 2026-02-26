import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/constants";

const locales = SUPPORTED_LOCALES;
const defaultLocale = DEFAULT_LOCALE;

/** RBAC roles allowed to access admin panel */
const ADMIN_ROLES = ["ADMIN", "EDITOR"] as const;

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // ── Admin route protection (/admin/* and /api/admin/*) ──────────────────
    const isAdminPage = pathname.startsWith("/admin");
    const isAdminApi = pathname.startsWith("/api/admin");

    if (isAdminPage || isAdminApi) {
        // Allow login page and NextAuth API routes (no auth needed)
        if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
            return NextResponse.next();
        }

        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        console.log("MW pathname:", pathname);
        console.log("MW has cookie:", !!request.headers.get("cookie"));
        console.log("MW token:", token);

        // No token → redirect pages to login, return 401 for API
        if (!token) {
            if (isAdminApi) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Token present but role not recognised → 403
        const tokenRole = token.role as string | undefined;
        if (!tokenRole || !ADMIN_ROLES.includes(tokenRole as (typeof ADMIN_ROLES)[number])) {
            if (isAdminApi) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        return NextResponse.next();
    }

    // ── Locale routing for public site ─────────────────────────────────────
    // Exclude static resources, API routes, and admin routes from locale handling
if (
  pathname.startsWith("/_next") ||
  pathname.includes(".") ||
  pathname.startsWith("/api") ||
  pathname.startsWith("/admin")
) {
  return;
}

    const pathnameIsMissingLocale = locales.every(
        (locale) =>
            !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
        const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;

        let locale: Locale = defaultLocale;
        if (localeCookie && isValidLocale(localeCookie)) {
            locale = localeCookie;
        } else {
            const acceptLanguage = request.headers.get("Accept-Language");
            if (acceptLanguage?.includes("de")) {
                locale = "de";
            }
        }

        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
                request.url
            )
        );
    }
}

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};
