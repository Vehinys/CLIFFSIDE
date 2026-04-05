import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Permission } from "@/generated/prisma/client";
import { authConfig } from "./auth.config";
import { RESOURCES, ACTIONS } from "./permissions";

const ALL_PERMISSIONS = RESOURCES.flatMap((resource) =>
  ACTIONS.map((action) => ({ resource, action }))
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            role: {
              include: { permissions: true },
            },
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          roleName: user.role?.name ?? null,
          isSuperAdmin: user.isSuperAdmin,
          permissions: user.isSuperAdmin
            ? ALL_PERMISSIONS
            : (user.role?.permissions ?? []).map((p: Permission) => ({
                resource: p.resource,
                action: p.action,
              })),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as Record<string, unknown>).roleId = user.roleId ?? null;
        (token as Record<string, unknown>).roleName = user.roleName ?? null;
        (token as Record<string, unknown>).isSuperAdmin = user.isSuperAdmin ?? false;
        (token as Record<string, unknown>).permissions = user.permissions ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roleId = (token.roleId as string | null) ?? null;
        session.user.roleName = (token.roleName as string | null) ?? null;
        session.user.isSuperAdmin = (token.isSuperAdmin as boolean) ?? false;
        session.user.permissions = (token.permissions as Array<{ resource: string; action: string }>) ?? [];
      }
      return session;
    },
  },
});
