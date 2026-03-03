/**
 * Extend NextAuth/Auth.js session types with custom user properties
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

// Auth.js v5 JWT types live in @auth/core/jwt
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export { };
