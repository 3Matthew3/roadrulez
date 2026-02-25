/**
 * Extend NextAuth session types with custom user properties
 */
import type { DefaultSession } from "next-auth";

type UserRole = "ADMIN" | "EDITOR" | "REVIEWER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export {};
