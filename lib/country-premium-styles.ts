/** Shared Tailwind classes for premium country pages (light + dark). */
export const COUNTRY_PAGE_BG =
    "bg-[#F5F7FB] text-[#0F172A] dark:bg-[#0B1120] dark:text-slate-100"

export const COUNTRY_CARD =
    "rounded-2xl border border-[#E2E8F0] bg-white shadow-sm dark:border-slate-700 dark:bg-[#1E293B] dark:shadow-none"

export const COUNTRY_PREMIUM = {
    page: `min-h-screen ${COUNTRY_PAGE_BG}`,
    content: "mx-auto w-full max-w-6xl px-4 md:px-6",
    card: COUNTRY_CARD,
    muted: "text-[#475569] dark:text-slate-400",
    heading: "text-[#0F172A] dark:text-white",
    body: "text-[#334155] dark:text-slate-200",
    link: "text-[#64748B] transition-colors hover:text-[#0F172A] dark:text-slate-500 dark:hover:text-slate-300",
    statsBar:
        "border-[#E2E8F0] bg-[#E2E8F0] shadow-md dark:border-slate-700 dark:bg-slate-800 dark:shadow-xl",
    statsCell: "bg-white dark:bg-[#1E293B]",
    statsCellBorder: "md:border-r md:border-[#E2E8F0] dark:md:border-slate-700",
    disclaimer:
        "rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] dark:border-slate-700 dark:bg-[#1E293B]",
    iconBox: "bg-[#F1F5F9] text-[#475569] dark:bg-slate-800 dark:text-slate-300",
    speedCard:
        "rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] dark:border-slate-600 dark:bg-slate-800",
    speedIllustration: "bg-[#EEF2FF] dark:bg-slate-900/80",
    accordionBorder: "border-[#E2E8F0] dark:border-slate-700",
    accordionItem:
        "rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] dark:border-slate-600 dark:bg-slate-800",
    notesBar:
        "border-t border-[#E2E8F0] bg-[#F8FAFC] dark:border-slate-700 dark:bg-[#1E293B]",
    heroGradLight:
        "absolute inset-0 z-10 bg-gradient-to-t from-[#F5F7FB] from-25% via-[#F5F7FB]/90 to-slate-900/30 dark:hidden",
    heroGradDark:
        "absolute inset-0 z-10 hidden bg-gradient-to-t from-[#0B1120] from-25% via-[#0B1120]/75 to-black/20 dark:block",
} as const
