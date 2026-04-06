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
      // À la connexion initiale, stocker l'ID
      if (user) {
        token.id = user.id;
      }

      // Re-fetch systématique depuis la DB pour refléter les changements de rôle/permissions
      // sans nécessiter de re-connexion
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            roleId: true,
            isSuperAdmin: true,
            role: {
              select: {
                name: true,
                permissions: { select: { resource: true, action: true } },
              },
            },
          },
        });
        if (dbUser) {
          (token as Record<string, unknown>).roleId = dbUser.roleId ?? null;
          (token as Record<string, unknown>).roleName = dbUser.role?.name ?? null;
          (token as Record<string, unknown>).isSuperAdmin = dbUser.isSuperAdmin;
          (token as Record<string, unknown>).permissions = dbUser.isSuperAdmin
            ? ALL_PERMISSIONS
            : (dbUser.role?.permissions ?? []).map((p) => ({
                resource: p.resource,
                action: p.action,
              }));
        }
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
