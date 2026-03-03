import { RealHomePage } from "@/components/real-home-page"
import { ComingSoonPage } from "@/components/coming-soon-page"
import { AccessGate } from "@/components/access-gate"

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    // Check for environment variable
    const isLive = process.env.ROADRULEZ_LAUNCH_MODE === "LIVE"

    return (
        <AccessGate>
            {isLive ? <RealHomePage lang={lang} /> : <ComingSoonPage />}
        </AccessGate>
    )
}
