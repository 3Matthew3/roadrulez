import LegalContentPage from "@/components/legal-content-page"
import { getDictionary } from "@/lib/dictionaries"

export default async function PrivacyPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)

    return (
        <LegalContentPage title={dict.extra.footer.privacy}>
            <p>{dict.extra.legal_pages.privacy_body}</p>
        </LegalContentPage>
    )
}
