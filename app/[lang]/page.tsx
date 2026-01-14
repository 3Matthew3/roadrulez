import { RealHomePage } from "@/components/real-home-page"
import { ComingSoonPage } from "@/components/coming-soon-page"

export default async function Home({ params }: { params: { lang: string } }) {
    // Check for environment variable
    const isLive = process.env.ROADRULEZ_LAUNCH_MODE === "LIVE"

    if (isLive) {
        return <RealHomePage lang={params.lang} />
    }

    // Default to Coming Soon
    return <ComingSoonPage />
}
