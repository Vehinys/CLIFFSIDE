import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Permission } from "@/generated/prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
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
          permissions: (user.role?.permissions ?? []).map((p: Permission) => ({
            resource: p.resource,
            action: p.action,
          })),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;

      // Recharge les permissions depuis la DB à chaque requête
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { role: { include: { permissions: true } } },
        });
        token.roleId = dbUser?.roleId ?? null;
        token.roleName = dbUser?.role?.name ?? null;
        token.permissions = (dbUser?.role?.permissions ?? []).map((p) => ({
          resource: p.resource,
          action: p.action,
        }));
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roleId = (token.roleId as string | null) ?? null;
        session.user.roleName = (token.roleName as string | null) ?? null;
        session.user.permissions = (token.permissions as Array<{
          resource: string;
          action: string;
        }>) ?? [];
      }
      return session;
    },
  },
});
