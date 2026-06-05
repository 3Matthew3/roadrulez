import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getDictionary } from "@/lib/dictionaries"
import { Suspense } from "react"
import { PlausibleProvider } from "@/components/plausible-provider"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PublicSessionProvider } from "@/components/public-session-provider"
import { HtmlLang } from "@/components/html-lang"

export const metadata: Metadata = {
    title: "RoadRulez - Drive Safe, Everywhere",
    description: "Your ultimate guide to traffic rules and driving etiquette around the world.",
}

export default async function LangLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode
    params: { lang: string }
}>) {
    const dict = await getDictionary(params.lang)

    return (
        <>
            <HtmlLang lang={params.lang} />
            <Suspense fallback={null}>
                <PlausibleProvider />
            </Suspense>
            <PublicSessionProvider>
                <div className="relative flex min-h-screen flex-col">
                    <SiteHeader lang={params.lang} />
                    <div className="flex-1">{children}</div>
                    <SiteFooter dict={dict} lang={params.lang} />
                </div>
            </PublicSessionProvider>
            <Analytics />
            <SpeedInsights />
        </>
    )
}
