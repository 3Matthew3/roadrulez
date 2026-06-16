import type { Metadata } from "next"
import { HomeTestVariantC } from "@/components/home-test/variant-c"
import { getHomeTestContext } from "@/lib/home-test-shared"

export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

export default async function HomeTestVariantCPage({ params }: { params: { lang: string } }) {
    const ctx = await getHomeTestContext(params.lang)
    return <HomeTestVariantC lang={params.lang} ctx={ctx} />
}
