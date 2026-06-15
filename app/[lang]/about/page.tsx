import LegalContentPage from "@/components/legal-content-page"
import { getDictionary } from "@/lib/dictionaries"

export default async function AboutPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)

    return (
        <LegalContentPage title={dict.extra.footer.about}>
            <p>{dict.extra.legal_pages.about_body}</p>
        </LegalContentPage>
    )
}
