/** Ignore placeholder / invalid DSN values that crash Sentry.init in the browser. */
export function resolveSentryDsn(value: string | undefined): string | undefined {
    if (!value) return undefined
    const trimmed = value.trim()
    if (!trimmed || trimmed === "public" || trimmed === "disabled") return undefined
    if (!trimmed.startsWith("https://")) return undefined
    return trimmed
}
