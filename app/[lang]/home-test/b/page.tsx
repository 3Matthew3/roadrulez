import type { Metadata } from "next"
import { HomeTestVariantB } from "@/components/home-test/variant-b"
import { getHomeTestContext } from "@/lib/home-test-shared"

export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

export default async function HomeTestVariantBPage({ params }: { params: { lang: string } }) {
    const ctx = await getHomeTestContext(params.lang)
    return <HomeTestVariantB lang={params.lang} ctx={ctx} />
}
