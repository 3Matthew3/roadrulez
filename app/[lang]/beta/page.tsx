import { RealHomePage } from "@/components/real-home-page"
import { ComingSoonPage } from "@/components/coming-soon-page"
import { AccessGate } from "@/components/access-gate"

export default function Home({ params }: { params: { lang: string } }) {
    // Check for environment variable
    const isLive = process.env.ROADRULEZ_LAUNCH_MODE === "LIVE"

    return (
        <AccessGate>
            {isLive ? <RealHomePage lang={params.lang} /> : <ComingSoonPage />}
        </AccessGate>
    )
}
