/**
 * DB-backed rate limiting for admin login.
 *
 * Strategy:
 *   - Primary lock is per EMAIL (protects accounts regardless of IP).
 *   - IP contributes a secondary signal stored separately.
 *   - The indexed `identifier` column is a SHA-256 hex of "ip|email"
 *     so neither value is stored in the index in plaintext.
 *   - After MAX_ATTEMPTS failures the account is locked for LOCKOUT_MS.
 *   - Cleanup: rows older than CLEANUP_DAYS are pruned on each check
 *     (lazy cleanup — no background job needed for small user bases).
 */

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 10;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_DAYS = 30; // delete rows older than this

/** Hash ip + email into a short, opaque index key. */
function makeIdentifier(ip: string, email: string): string {
    return createHash("sha256")
        .update(`${ip}|${email.toLowerCase()}`)
        .digest("hex");
}

/**
 * Extract the client IP from Next.js request headers.
 * Handles x-forwarded-for with multiple IPs (take the first / leftmost).
 * Falls back to "unknown" if nothing is available.
 */
export function extractClientIp(headers: Headers): string {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
        // x-forwarded-for can be "client, proxy1, proxy2" — leftmost is client
        const first = forwarded.split(",")[0].trim();
        if (first) return first;
    }
    const realIp = headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    return "unknown";
}

/** Lazy cleanup of stale LoginAttempt rows (older than CLEANUP_DAYS). */
async function cleanupStaleRecords(): Promise<void> {
    const cutoff = new Date(Date.now() - CLEANUP_DAYS * 24 * 60 * 60 * 1000);
    await prisma.loginAttempt.deleteMany({
        where: { updatedAt: { lt: cutoff } },
    });
}

/**
 * Check if a login attempt is currently allowed.
 * Returns { allowed: true } or { allowed: false, remainingSeconds }.
 */
export async function checkLoginAllowed(
    ip: string,
    email: string
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
    // Background cleanup (fire-and-forget, don't block login)
    cleanupStaleRecords().catch(() => undefined);

    const identifier = makeIdentifier(ip, email);
    const record = await prisma.loginAttempt.findFirst({
        where: { identifier },
    });

    if (record?.lockedUntil && record.lockedUntil > new Date()) {
        const remainingMs = record.lockedUntil.getTime() - Date.now();
        return { allowed: false, remainingSeconds: Math.ceil(remainingMs / 1000) };
    }

    return { allowed: true };
}

/**
 * Record a failed login attempt. Applies lockout if threshold is reached.
 */
export async function recordFailedAttempt(ip: string, email: string): Promise<void> {
    const identifier = makeIdentifier(ip, email);

    const existing = await prisma.loginAttempt.findFirst({ where: { identifier } });

    const newCount = (existing?.failCount ?? 0) + 1;
    const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;

    if (existing) {
        await prisma.loginAttempt.update({
            where: { id: existing.id },
            data: {
                failCount: newCount,
                lockedUntil,
                lastAttempt: new Date(),
            },
        });
    } else {
        await prisma.loginAttempt.create({
            data: {
                identifier,
                ip,
                email: email.toLowerCase(),
                failCount: 1,
                lockedUntil,
                lastAttempt: new Date(),
            },
        });
    }
}

/**
 * On successful login, reset the fail counter for this ip+email pair.
 */
export async function recordSuccessfulLogin(ip: string, email: string): Promise<void> {
    const identifier = makeIdentifier(ip, email);
    await prisma.loginAttempt.updateMany({
        where: { identifier },
        data: { failCount: 0, lockedUntil: null, lastAttempt: new Date() },
    });
}
