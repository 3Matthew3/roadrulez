interface SiteFooterProps {
    dict: {
        extra: {
            footer: {
                about: string;
                sources: string;
                contact: string;
                legal: string;
                privacy: string;
                terms: string;
            }
        },
        common: {
            disclaimer: string;
        }
    }
    lang: string
}

export function SiteFooter({ dict, lang }: SiteFooterProps) {
    return (
        <footer className="border-t border-zinc-800 bg-[#0a0e17] py-8 text-center text-sm text-zinc-500">
            <div className="container flex flex-col items-center justify-between gap-4 px-4">
                <p className="flex items-center justify-center gap-2 mb-4">
                    <span className="block" >
                        {dict.common.disclaimer}
                    </span>
                </p>
                <div className="flex justify-center gap-6 mb-8 flex-wrap">
                    <a href={`/${lang}/impressum`} className="hover:text-zinc-300 transition-colors">
                        {dict.extra.footer.legal}
                    </a>
                    {/* Placeholders for future pages */}
                    <span className="opacity-50 cursor-not-allowed text-zinc-600">{dict.extra.footer.about}</span>
                    <span className="opacity-50 cursor-not-allowed text-zinc-600">{dict.extra.footer.sources}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p>&copy; {new Date().getFullYear()} RoadRulez.</p>
                </div>
            </div>
        </footer>
    )
}
