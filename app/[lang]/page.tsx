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

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <AccessGate>
      <RealHomePage lang={lang} />
    </AccessGate>
  )
}
