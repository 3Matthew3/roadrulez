/**
 * Edge-safe auth config — no Node.js modules (no fs, crypto, bcrypt, prisma)
 * Used by middleware which runs in the Edge Runtime.
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 4 * 60 * 60, // 4 hours
    },
    pages: {
        signIn: "/admin/login",
    },
    providers: [], // Providers are added in lib/auth.ts (Node.js only)
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
