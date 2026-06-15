import LegalContentPage from "@/components/legal-content-page"
import { getDictionary } from "@/lib/dictionaries"

export default async function DisclaimerPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)

    return (
        <LegalContentPage title={dict.extra.footer.disclaimer}>
            <p>{dict.extra.legal_pages.disclaimer_body}</p>
        </LegalContentPage>
    )
}
