import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "RoadRulez - Drive Safe, Everywhere",
    description: "Your ultimate guide to traffic rules and driving etiquette around the world.",
};

import { getDictionary } from "@/lib/dictionaries"

// ... imports

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
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark" // Force dark mode as default per design preference
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
