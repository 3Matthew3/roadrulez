import { RealHomePage } from "@/components/real-home-page"
import { AccessGate } from "@/components/access-gate"
import { getDictionary } from "@/lib/dictionaries"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang)

  return {
    title: dict.metadata.title,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function Home({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang)

  return (
    <AccessGate labels={dict.access_gate}>
      <RealHomePage lang={params.lang} />
    </AccessGate>
  )
}
