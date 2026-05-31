import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/constants";

const locales = SUPPORTED_LOCALES;
const defaultLocale = DEFAULT_LOCALE;

/** RBAC roles allowed to access admin panel */
const ADMIN_ROLES = ["ADMIN", "EDITOR"] as const;

function detectPreferredLocale(acceptLanguage: string | null): Locale | undefined {
    if (!acceptLanguage) return undefined;

    const requestedLocales = acceptLanguage
        .toLowerCase()
        .split(",")
        .map((part) => part.split(";")[0]?.trim().split("-")[0])
        .filter(Boolean);

    return requestedLocales.find((locale): locale is Locale => isValidLocale(locale));
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length >= 2 && isValidLocale(segments[0]) && isValidLocale(segments[1])) {
        const normalizedUrl = request.nextUrl.clone();
        normalizedUrl.pathname = `/${segments[1]}${segments.length > 2 ? `/${segments.slice(2).join("/")}` : ""}`;
        return NextResponse.redirect(normalizedUrl);
    }

    // ── Admin route protection (/admin/* and /api/admin/*) ──────────────────
    const isAdminPage = pathname.startsWith("/admin");
    const isAdminApi = pathname.startsWith("/api/admin");

    if (pathname === "/admin/logon" || pathname === "/admin/signin" || pathname === "/admin/sign-in") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (isAdminPage || isAdminApi) {
        // Allow login page and NextAuth API routes (no auth needed)
        if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
            return NextResponse.next();
        }

        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
          secureCookie: true,
        });

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
            const preferredLocale = detectPreferredLocale(acceptLanguage);
            if (preferredLocale) {
                locale = preferredLocale;
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
