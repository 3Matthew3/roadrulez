import NextAuth, { type NextAuthConfig } from "next-auth";
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

export const authConfig: NextAuthConfig = {
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
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
            async authorize(credentials, request) {
                // ── 1. Basic input validation ────────────────────────────────
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Login failed");
                }

                // ── 2. Extract client IP (Web Request API in Auth.js v5) ─────
                const headers = request instanceof Request
                    ? request.headers
                    : new Headers();
                const ip = extractClientIp(headers);
                const email = (credentials.email as string).toLowerCase().trim();

                // ── 3. Rate-limit check ───────────────────────────────────────
                const rateCheck = await checkLoginAllowed(ip, email);
                if (!rateCheck.allowed) {
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
                const passwordHash = user?.passwordHash ?? "$2b$10$invalidhashpadding000000000000000000000";
                const isValid = await bcrypt.compare(credentials.password as string, passwordHash);

                if (!user || !isValid) {
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
                token.id = user.id as string;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

// ── Convenience helpers (same API as before for server components) ────────────

export async function getServerSession() {
    return auth();
}

export async function requireAuth() {
    const session = await auth();
    if (!session?.user) return null;
    return session;
}

export async function requireAdmin() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || role !== USER_ROLE.ADMIN) return null;
    return session;
}

export async function requireEditor() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== USER_ROLE.ADMIN && role !== USER_ROLE.EDITOR)) return null;
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
