import { getServerSession as nextAuthGetServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
    checkLoginAllowed,
    recordFailedAttempt,
    recordSuccessfulLogin,
    extractClientIp,
} from "@/lib/rate-limit";
import { createAuditLog } from "@/lib/audit";

const USER_ROLE = {
    ADMIN: "ADMIN",
    EDITOR: "EDITOR",
} as const;

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
     trustHost: true,
    session: {
        strategy: "jwt",
        maxAge: 4 * 60 * 60, // 4 hours — short admin session
    },
    pages: {
        signIn: "/admin/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                // ── 1. Basic input validation ────────────────────────────────
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Login failed");
                }

                // ── 2. Extract client IP (safe proxy handling) ───────────────
                // NextAuth passes the raw node IncomingMessage; wrap headers for helper
                const headerObj = req?.headers
                    ? new Headers(
                        Object.entries(req.headers as Record<string, string | string[]>).flatMap(
                            ([k, v]) =>
                                Array.isArray(v)
                                    ? v.map((vv) => [k, vv] as [string, string])
                                    : [[k, v] as [string, string]]
                        )
                    )
                    : new Headers();
                const ip = extractClientIp(headerObj);
                const email = credentials.email.toLowerCase().trim();

                // ── 3. Rate-limit check ───────────────────────────────────────
                const rateCheck = await checkLoginAllowed(ip, email);
                if (!rateCheck.allowed) {
                    // Log the lockout event (don't block if audit fails)
                    createAuditLog({
                        entityType: "auth",
                        entityId: email,
                        action: "lockout",
                        note: `Login blocked — rate limit exceeded`,
                    }).catch((err) => {
                        console.error("[AUTH] Failed to audit lockout event:", err);
                    });
                    throw new Error("Too many attempts. Please try again later.");
                }

                // ── 4. Look up user ───────────────────────────────────────────
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                // ── 5. Verify password (constant-time via bcrypt) ─────────────
                // Always run bcrypt even for unknown users to prevent timing attacks
                const passwordHash = user?.passwordHash ?? "$2b$10$invalidhashpadding000000000000000000000";
                const isValid = await bcrypt.compare(credentials.password, passwordHash);

                if (!user || !isValid) {
                    // Record failure + audit log
                    recordFailedAttempt(ip, email).catch((err) => {
                        console.error("[AUTH] Failed to record failed attempt:", err);
                    });
                    createAuditLog({
                        entityType: "auth",
                        entityId: email,
                        action: "login_failure",
                        note: `Failed login attempt`,
                    }).catch((err) => {
                        console.error("[AUTH] Failed to audit login failure:", err);
                    });
                    throw new Error("Login failed");
                }

                // ── 6. Successful login ───────────────────────────────────────
                recordSuccessfulLogin(ip, email).catch((err) => {
                    console.error("[AUTH] Failed to record successful login:", err);
                });
                createAuditLog({
                    actorUserId: user.id,
                    entityType: "auth",
                    entityId: user.id,
                    action: "login_success",
                    note: `Successful login`,
                }).catch((err) => {
                    console.error("[AUTH] Failed to audit login success:", err);
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
};

export async function getServerSession() {
    return nextAuthGetServerSession(authOptions);
}

export async function requireAuth() {
    const session = await getServerSession();
    if (!session?.user) {
        return null;
    }
    return session;
}

export async function requireAdmin() {
    const session = await getServerSession();
    const role = (session?.user as any)?.role;
    if (!session?.user || role !== USER_ROLE.ADMIN) {
        return null;
    }
    return session;
}

export async function requireEditor() {
    const session = await getServerSession();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== USER_ROLE.ADMIN && role !== USER_ROLE.EDITOR)) {
        return null;
    }
    return session;
}

/** Route handler guard — returns 401/403 response or the session */
export async function withAdminAuth(handler: (session: any) => Promise<Response>): Promise<Response> {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(session);
}

export async function withEditorAuth(handler: (session: any) => Promise<Response>): Promise<Response> {
    const session = await requireEditor();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(session);
}
