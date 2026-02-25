-- Migration: add_login_attempts
-- Adds the login_attempts table for brute-force / credential-stuffing protection.
-- identifier: SHA-256 hash of "ip|email" — never stored in plaintext in the index.
-- Rows older than 30 days are lazily pruned by rate-limit.ts.

CREATE TABLE "login_attempts" (
    "id"           TEXT         NOT NULL,
    "identifier"   TEXT         NOT NULL,
    "ip"           TEXT         NOT NULL,
    "email"        TEXT         NOT NULL,
    "failCount"    INTEGER      NOT NULL DEFAULT 0,
    "lockedUntil"  TIMESTAMP(3),
    "lastAttempt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_attempts_identifier_idx" ON "login_attempts"("identifier");
