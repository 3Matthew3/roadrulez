import * as Sentry from "@sentry/nextjs"

export function captureException(error: unknown, context?: Record<string, unknown>) {
  try {
    // Always log locally for visibility
    console.error("[monitor]", error, context ?? "")
  } catch {}

  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    try {
      Sentry.captureException(error, { extra: context })
    } catch (e) {
      // don't throw from monitoring
      console.error("[monitor] failed to capture to Sentry", e)
    }
  }
}

export function captureMessage(message: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    try {
      Sentry.captureMessage(message)
    } catch (e) {
      console.error("[monitor] failed to send message to Sentry", e)
    }
  } else {
    console.log("[monitor]", message)
  }
}
