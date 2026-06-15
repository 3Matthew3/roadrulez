import LegalContentPage from "@/components/legal-content-page"
import { getDictionary } from "@/lib/dictionaries"

export default async function DataVerificationPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)

    return (
        <LegalContentPage title={dict.extra.footer.data_verification}>
            <p>{dict.extra.legal_pages.data_verification_body}</p>
        </LegalContentPage>
    )
}
