import Link from "next/link"
import { cn } from "@/lib/utils"

const VARIANTS = [
    { id: "a", href: "a" },
    { id: "b", href: "b" },
    { id: "c", href: "c" },
] as const

export function HomeTestVariantNav({
    lang,
    active,
}: {
    lang: string
    active: "index" | "a" | "b" | "c"
}) {
    return (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
            <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-950/90 px-2 py-1.5 text-xs shadow-xl backdrop-blur-md">
                <Link
                    href={`/${lang}/home-test`}
                    className={cn(
                        "rounded-full px-2.5 py-1 text-zinc-400 transition hover:text-white",
                        active === "index" && "bg-zinc-800 text-white"
                    )}
                >
                    ···
                </Link>
                {VARIANTS.map(({ id, href }) => (
                    <Link
                        key={id}
                        href={`/${lang}/home-test/${href}`}
                        className={cn(
                            "rounded-full px-2.5 py-1 font-medium uppercase tracking-wide text-zinc-400 transition hover:text-white",
                            active === id && "bg-blue-600/90 text-white"
                        )}
                    >
                        {id}
                    </Link>
                ))}
            </div>
        </div>
    )
}
