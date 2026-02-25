import { NextResponse } from "next/server"

export async function GET() {
  // Deliberately throw to verify Sentry is wired up in server environment
  throw new Error("Sentry test - server error")
}
