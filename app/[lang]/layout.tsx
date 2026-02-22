import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getDictionary } from "@/lib/dictionaries"
import { Suspense } from "react"
import { PlausibleProvider } from "@/components/plausible-provider"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "RoadRulez - Drive Safe, Everywhere",
    description: "Your ultimate guide to traffic rules and driving etiquette around the world.",
};

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: { lang: string };
}>) {
    const dict = await getDictionary(params.lang)

    return (
        <html lang={params.lang}>
            <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
                {/* Plausible tracker — must be in Suspense because it uses useSearchParams */}
                <Suspense fallback={null}>
                    <PlausibleProvider />
                </Suspense>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <div className="relative flex min-h-screen flex-col">
                        <SiteHeader lang={params.lang} />
                        <div className="flex-1">{children}</div>
                        <SiteFooter dict={dict} lang={params.lang} />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
