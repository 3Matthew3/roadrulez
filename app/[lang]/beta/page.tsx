import { RealHomePage } from "@/components/real-home-page"
import { ComingSoonPage } from "@/components/coming-soon-page"
import { AccessGate } from "@/components/access-gate"
import { getDictionary } from "@/lib/dictionaries"

export default async function Home({ params }: { params: { lang: string } }) {
    // Check for environment variable
    const isLive = process.env.ROADRULEZ_LAUNCH_MODE === "LIVE"
    const dict = await getDictionary(params.lang)

    return (
        <AccessGate labels={dict.access_gate}>
            {isLive ? <RealHomePage lang={params.lang} /> : <ComingSoonPage labels={dict.coming_soon} />}
        </AccessGate>
    )
}
