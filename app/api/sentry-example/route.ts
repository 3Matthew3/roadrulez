import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  // Opt-in crash test: call /api/sentry-example?crash=1 when you want to verify Sentry.
  return NextResponse.json({
    ok: true,
    message: "Sentry test endpoint is healthy. Add ?crash=1 behavior if needed.",
  })
}
