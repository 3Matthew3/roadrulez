import { cn } from "@/lib/utils"

export function HomeHeroShell({
    children,
    centered = false,
    className,
}: {
    children: React.ReactNode
    centered?: boolean
    className?: string
}) {
    return (
        <section
            className={cn(
                "relative -mt-16 flex min-h-[90vh] flex-col justify-center overflow-hidden bg-[#0a0e17]",
                className
            )}
        >
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0a0e17]/70 via-[#0a0e17]/50 to-[#0a0e17]" />
                <div className="pointer-events-none absolute right-[-10%] top-[-20%] z-10 h-[80%] w-[80%] rounded-full bg-blue-600/20 blur-[120px]" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/hero-globe.png"
                    alt=""
                    className="h-full w-full object-cover object-right opacity-90"
                />
            </div>

            <div
                className={cn(
                    "container relative z-20 px-4 pt-20 md:px-6",
                    centered && "text-center"
                )}
            >
                {children}
            </div>
        </section>
    )
}
