import { cn } from "@/lib/utils"
import { COUNTRY_PAGE_BG, COUNTRY_PREMIUM as S } from "@/lib/country-premium-styles"

interface LegalContentPageProps {
    title: string
    children: React.ReactNode
}

export default function LegalContentPage({ title, children }: LegalContentPageProps) {
    return (
        <div className={cn("min-h-[60vh]", COUNTRY_PAGE_BG)}>
            <div className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">
                <h1 className={cn("text-3xl font-bold", S.heading)}>{title}</h1>
                <div className={cn("mt-8 space-y-4 text-base leading-relaxed", S.body)}>{children}</div>
            </div>
        </div>
    )
}
