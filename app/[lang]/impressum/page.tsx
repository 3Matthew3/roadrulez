import { Badge } from "@/components/ui/badge"
import { getDictionary } from "@/lib/dictionaries"

export default async function ImpressumPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)
    const isDe = params.lang === 'de'

    return (
        <div className="container px-4 py-12 md:py-20 md:px-6 max-w-3xl text-zinc-300">
            <h1 className="text-3xl font-bold text-white mb-8">{isDe ? "Impressum" : "Legal Notice (Impressum)"}</h1>

            <section className="space-y-6 mb-12">
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {isDe ? "Angaben gemäß § 5 TMG" : "Information according to § 5 TMG"}
                    </h2>
                    <div className="space-y-4 font-mono text-sm bg-black/20 p-4 rounded-lg border border-zinc-800/50">
                        <p className="text-amber-500 mb-2"> {/* {isDe ? "BITTE ERSETZEN SIE DIESE PLATZHALTER" : "PLEASE REPLACE THESE PLACEHOLDERS"}*/}</p>
                        <p>
                            [Company Name / Legal Entity]<br />
                            [Street Address]<br />
                            [Zip Code] [City]<br />
                            [Country]
                        </p>
                        <p>
                            <strong>{isDe ? "Vertreten durch:" : "Represented by:"}</strong><br />
                            [Managing Director Name]
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {isDe ? "Kontakt" : "Contact"}
                    </h2>
                    <div className="space-y-2">
                        <p>
                            <strong>{isDe ? "Telefon:" : "Phone:"}</strong> [Phone Number]
                        </p>
                        <p>
                            <strong>{isDe ? "E-Mail:" : "Email:"}</strong> [Email Address]
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {isDe ? "Registereintrag" : "Register Entry"}
                    </h2>
                    <div className="space-y-2">
                        <p>
                            {isDe ? "Eintragung im Handelsregister." : "Entry in the commercial register."}<br />
                            <strong>{isDe ? "Registergericht:" : "Register Court:"}</strong> [Court Name]<br />
                            <strong>{isDe ? "Registernummer:" : "Registration Number:"}</strong> [HRB Number]
                        </p>
                        <p className="mt-4">
                            <strong>{isDe ? "Umsatzsteuer-ID:" : "VAT ID:"}</strong><br />
                            {isDe ? "Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:" : "Sales tax identification number according to §27 a sales tax law:"}<br />
                            [DE 123 456 789]
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {isDe ? "Streitschlichtung" : "Dispute Resolution"}
                    </h2>
                    <p className="leading-relaxed">
                        {isDe
                            ? "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr"
                            : "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr"}
                    </p>
                    <p className="leading-relaxed mt-4">
                        {isDe
                            ? "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
                            : "We are not willing or obliged to participate in dispute settlement procedures before a consumer arbitration board."}
                    </p>
                </div>
            </section>
        </div>
    )
}
