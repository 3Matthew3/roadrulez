import Link from "next/link"

interface SiteFooterProps {
    dict: {
        extra: {
            footer: {
                about: string
                sources: string
                contact: string
                legal: string
                privacy: string
                terms: string
                last_update: string
                data_source: string
                feedback_welcome: string
            }
        }
        common: {
            disclaimer: string
        }
    }
    lang: string
}

export function SiteFooter({ dict, lang }: SiteFooterProps) {
    return (
        <footer className="border-t border-slate-200 bg-[#F5F7FA] py-10 text-sm text-slate-600 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-400">
            <div className="container mx-auto max-w-5xl px-4 text-center">
                <p className="mb-4 text-slate-700 dark:text-slate-300">{dict.common.disclaimer}</p>

                <div className="mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-slate-500 dark:text-slate-400">
                    <span>{dict.extra.footer.last_update}</span>
                    <span className="hidden sm:inline" aria-hidden="true">
                        ·
                    </span>
                    <span>{dict.extra.footer.data_source}</span>
                    <span className="hidden sm:inline" aria-hidden="true">
                        ·
                    </span>
                    <span>{dict.extra.footer.feedback_welcome}</span>
                </div>

                <nav className="mb-8 flex flex-wrap justify-center gap-6">
                    <a
                        href={`/${lang}/impressum`}
                        className="transition-colors hover:text-[#2563EB] dark:hover:text-[#3B82F6]"
                    >
                        {dict.extra.footer.legal}
                    </a>
                    <span className="cursor-not-allowed text-slate-400 dark:text-slate-600">
                        {dict.extra.footer.about}
                    </span>
                    <Link
                        href={`/${lang}/sources`}
                        className="transition-colors hover:text-[#2563EB] dark:hover:text-[#3B82F6]"
                    >
                        {dict.extra.footer.sources}
                    </Link>
                </nav>

                <p className="text-slate-500 dark:text-slate-500">
                    &copy; {new Date().getFullYear()} RoadRulez.
                </p>
            </div>
        </footer>
    )
}
