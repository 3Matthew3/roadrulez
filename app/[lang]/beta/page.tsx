import { RealHomePage } from "@/components/real-home-page"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "RoadRulez App",
    robots: {
        index: false,
        follow: false,
    },
}

export default function BetaPage({ params }: { params: { lang: string } }) {
    return <RealHomePage lang={params.lang} />
}
