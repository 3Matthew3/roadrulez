import Link from "next/link"

import HeroImage from "@/components/country/hero-image"

import { cn } from "@/lib/utils"

import { formatVerifiedMonth } from "@/lib/fines-display"

import { COUNTRY_PAGE_BG, COUNTRY_PREMIUM as S } from "@/lib/country-premium-styles"

import { ShieldCheck } from "lucide-react"



interface CountrySectionHeroProps {

    lang: string

    localizedName: string

    countryName: string

    countryIso2: string

    headerImages?: string[]

    breadcrumbHome: string

    breadcrumbCurrent: string

    title: string

    subtitle: string

    lastVerified?: string

    verifiedLabel: string

    sourceCount?: number

    sourcesBadgeLabel: string

    showFlag?: boolean

}



export default function CountrySectionHero({

    lang,

    localizedName,

    countryName,

    countryIso2,

    headerImages,

    breadcrumbHome,

    breadcrumbCurrent,

    title,

    subtitle,

    lastVerified,

    verifiedLabel,

    sourceCount,

    sourcesBadgeLabel,

    showFlag = true,

}: CountrySectionHeroProps) {

    const countryPath = `/${lang}/country/${countryIso2.toLowerCase()}`

    const verifiedMonth = formatVerifiedMonth(lastVerified, lang)



    return (

        <div className="relative min-h-[380px] w-full overflow-hidden md:min-h-[440px]">

            <div className="absolute inset-0 z-0 bg-[#111]">

                <HeroImage name={countryName} images={headerImages} />

                <div className={S.heroGradLight} />

                <div className={S.heroGradDark} />

            </div>



            <div className="relative z-20 mx-auto flex h-full min-h-[380px] w-full max-w-6xl flex-col px-4 pb-8 pt-8 md:min-h-[440px] md:px-6 md:pb-10 md:pt-10">

                <nav aria-label="Breadcrumb" className="mb-6">

                    <ol className="flex list-none flex-wrap items-center gap-1.5 text-sm text-white/70">

                        <li>

                            <Link href={`/${lang}`} className="transition-colors hover:text-white">

                                {breadcrumbHome}

                            </Link>

                        </li>

                        <li aria-hidden="true" className="text-white/40">

                            /

                        </li>

                        <li>

                            <Link href={countryPath} className="transition-colors hover:text-white">

                                {localizedName}

                            </Link>

                        </li>

                        <li aria-hidden="true" className="text-white/40">

                            /

                        </li>

                        <li className="font-medium text-white/90">{breadcrumbCurrent}</li>

                    </ol>

                </nav>



                <div className="mt-auto max-w-3xl">

                    <div className="mb-5 flex items-start gap-4">

                        {showFlag && (

                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/20 shadow-md md:h-16 md:w-24">

                                {/* eslint-disable-next-line @next/next/no-img-element */}

                                <img

                                    src={`https://flagcdn.com/w320/${countryIso2.toLowerCase()}.png`}

                                    alt={`${localizedName} flag`}

                                    className="h-full w-full object-cover"

                                />

                            </div>

                        )}

                        <div className="min-w-0">

                            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl md:leading-tight">

                                {title}

                            </h1>

                            <p className="mt-3 text-base leading-relaxed text-white/85 md:text-lg">

                                {subtitle}

                            </p>

                        </div>

                    </div>



                    <div className="flex flex-wrap items-center gap-2">

                        {verifiedMonth && (

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-100">

                                <ShieldCheck className="h-3.5 w-3.5" />

                                {verifiedLabel}: {verifiedMonth}

                            </span>

                        )}

                        {sourceCount !== undefined && sourceCount > 0 && (

                            <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1 text-xs font-medium text-white/90">

                                {sourcesBadgeLabel.replace("{count}", String(sourceCount))}

                            </span>

                        )}

                    </div>

                </div>

            </div>

        </div>

    )

}



export { COUNTRY_PAGE_BG as PAGE_BG }


