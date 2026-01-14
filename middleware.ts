import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "de"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Exclude static resources and api routes
    if (
        pathname.startsWith("/_next") ||
        pathname.includes(".") || // files with extensions (images, etc)
        pathname.startsWith("/api")
    ) {
        return;
    }

    if (pathnameIsMissingLocale) {
        // 1. Check for cookie
        const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;

        // 2. Check for Accept-Language header if cookie is missing
        let locale = defaultLocale;
        if (localeCookie && locales.includes(localeCookie)) {
            locale = localeCookie;
        } else {
            const acceptLanguage = request.headers.get("Accept-Language");
            if (acceptLanguage?.includes("de")) {
                locale = "de";
            }
        }

        // Redirect
        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, request.url)
        );
    }
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        "/((?!_next|favicon.ico).*)",
    ],
};
