import { getDictionary } from "@/lib/dictionaries"

export default async function ImpressumPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)
    const labels = dict.legal

    return (
        <div className="container px-4 py-12 md:py-20 md:px-6 max-w-3xl text-zinc-300">
            <h1 className="text-3xl font-bold text-white mb-8">{labels.title}</h1>

            <section className="space-y-6 mb-12">
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {labels.provider_info}
                    </h2>
                    <div className="space-y-4 font-mono text-sm bg-black/20 p-4 rounded-lg border border-zinc-800/50">
                        <p>
                            {labels.company_placeholder}<br />
                            {labels.street_placeholder}<br />
                            {labels.postal_city_placeholder}<br />
                            {labels.country_placeholder}
                        </p>
                        <p>
                            <strong>{labels.represented_by}</strong><br />
                            {labels.managing_director_placeholder}
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {labels.contact}
                    </h2>
                    <div className="space-y-2">
                        <p>
                            <strong>{labels.phone}</strong> {labels.phone_placeholder}
                        </p>
                        <p>
                            <strong>{labels.email}</strong> {labels.email_placeholder}
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {labels.register_entry}
                    </h2>
                    <div className="space-y-2">
                        <p>
                            {labels.commercial_register_entry}<br />
                            <strong>{labels.register_court}</strong> {labels.court_placeholder}<br />
                            <strong>{labels.registration_number}</strong> {labels.registration_number_placeholder}
                        </p>
                        <p className="mt-4">
                            <strong>{labels.vat_id}</strong><br />
                            {labels.vat_id_description}<br />
                            {labels.vat_id_placeholder}
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {labels.dispute_resolution}
                    </h2>
                    <p className="leading-relaxed">
                        {labels.odr_platform}
                    </p>
                    <p className="leading-relaxed mt-4">
                        {labels.consumer_arbitration}
                    </p>
                </div>
            </section>
        </div>
    )
}
