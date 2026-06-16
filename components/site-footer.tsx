import Link from "next/link"

interface SiteFooterProps {
    dict: {
        extra: {
            footer: {
                explore_heading: string
                countries: string
                roadrulez_heading: string
                about: string
                data_verification: string
                legal_heading: string
                impressum: string
                privacy: string
                disclaimer: string
                last_update: string
                data_source: string
                feedback_welcome: string
                tagline: string
            }
        }
        common: {
            disclaimer: string
        }
    }
    lang: string
}

const linkClass =
    "inline-block transition-colors hover:text-[#2563EB] dark:hover:text-[#3B82F6]"

function FooterColumn({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                {title}
            </h3>
            <ul className="space-y-2.5">{children}</ul>
        </div>
    )
}

export function SiteFooter({ dict, lang }: SiteFooterProps) {
    const f = dict.extra.footer

    return (
        <footer className="border-t border-slate-200 bg-[#F5F7FA] text-sm text-slate-600 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-400">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12">
                <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {dict.common.disclaimer}
                </p>

                <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link
                            href={`/${lang}`}
                            className="text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-[#2563EB] dark:text-white dark:hover:text-[#3B82F6]"
                        >
                            RoadRulez
                        </Link>
                        <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-500">
                            {f.tagline}
                        </p>
                    </div>

                    <FooterColumn title={f.explore_heading}>
                        <li>
                            <Link href={`/${lang}/countries`} className={linkClass}>
                                {f.countries}
                            </Link>
                        </li>
                    </FooterColumn>

                    <FooterColumn title={f.roadrulez_heading}>
                        <li>
                            <Link href={`/${lang}/about`} className={linkClass}>
                                {f.about}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${lang}/data-verification`} className={linkClass}>
                                {f.data_verification}
                            </Link>
                        </li>
                    </FooterColumn>

                    <FooterColumn title={f.legal_heading}>
                        <li>
                            <Link href={`/${lang}/impressum`} className={linkClass}>
                                {f.impressum}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${lang}/privacy`} className={linkClass}>
                                {f.privacy}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${lang}/disclaimer`} className={linkClass}>
                                {f.disclaimer}
                            </Link>
                        </li>
                    </FooterColumn>
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-slate-500 dark:text-slate-500">
                        &copy; {new Date().getFullYear()} RoadRulez
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500 dark:text-slate-500">
                        <span>{f.last_update}</span>
                        <span className="hidden sm:inline" aria-hidden="true">
                            ·
                        </span>
                        <span>{f.data_source}</span>
                        <span className="hidden md:inline" aria-hidden="true">
                            ·
                        </span>
                        <span className="hidden md:inline">{f.feedback_welcome}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
