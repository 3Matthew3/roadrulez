import { RealHomePage } from "@/components/real-home-page"
import { AccessGate } from "@/components/access-gate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "RoadRulez App",
  robots: {
    index: false,
    follow: false,
  },
}

export default function Home({ params }: { params: { lang: string } }) {
  return (
    <AccessGate>
      <RealHomePage lang={params.lang} />
    </AccessGate>
  )
}
