import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

export type AuditAction =
    | "create"
    | "update"
    | "delete"
    | "publish"
    | "verify"
    | "status_change"
    | "login_success"
    | "login_failure"
    | "lockout";

/**
 * Log audit events to a fallback file if database is unavailable.
 * Used when primary audit logging fails.
 */
async function writeFallbackAuditLog(data: any): Promise<void> {
    try {
        const logDir = path.join(process.cwd(), ".audit-logs");
        await fs.mkdir(logDir, { recursive: true });
        const logFile = path.join(logDir, `fallback-${new Date().toISOString().split("T")[0]}.ndjson`);
        await fs.appendFile(logFile, JSON.stringify({ ...data, timestamp: new Date() }) + "\n");
    } catch {
        // If even fallback fails, just log to console
        console.error("[AUDIT CRITICAL] Failed to write fallback audit log:", data);
    }
}

export async function createAuditLog({
    actorUserId,
    entityType,
    entityId,
    action,
    beforeValue,
    afterValue,
    note,
}: {
    actorUserId?: string;
    entityType: string;
    entityId: string;
    action: AuditAction;
    beforeValue?: Record<string, unknown>;
    afterValue?: Record<string, unknown>;
    note?: string;
}) {
    try {
        return await prisma.auditLog.create({
            data: {
                actorUserId,
                entityType,
                entityId,
                action,
                beforeValue: (beforeValue ?? undefined) as Prisma.JsonObject | undefined,
                afterValue: (afterValue ?? undefined) as Prisma.JsonObject | undefined,
                note,
            },
        });
    } catch (err) {
        // Log to fallback if database fails
        console.error("[AUDIT FAILED] Could not write to database:", err);
        await writeFallbackAuditLog({
            actorUserId,
            entityType,
            entityId,
            action,
            beforeValue,
            afterValue,
            note,
        });
        throw err; // Re-throw so caller knows it failed
    }
}
