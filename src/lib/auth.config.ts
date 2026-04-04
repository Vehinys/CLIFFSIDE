import type { NextAuthConfig } from "next-auth";

/**
 * Config Auth.js edge-compatible (sans Prisma, sans Node.js built-ins).
 * Utilisée par src/proxy.ts (Edge Runtime).
 * Étendue par src/lib/auth.ts (Node.js Runtime) avec le PrismaAdapter + Credentials.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {},
  providers: [],
} satisfies NextAuthConfig;
