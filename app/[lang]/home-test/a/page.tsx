import type { Metadata } from "next"
import { HomeTestVariantA } from "@/components/home-test/variant-a"
import { getHomeTestContext } from "@/lib/home-test-shared"

export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

export default async function HomeTestVariantAPage({ params }: { params: { lang: string } }) {
    const ctx = await getHomeTestContext(params.lang)
    return <HomeTestVariantA lang={params.lang} ctx={ctx} />
}
