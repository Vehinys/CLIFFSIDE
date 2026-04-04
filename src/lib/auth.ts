import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Permission } from "@/generated/prisma/client";
import { authConfig } from "./auth.config";

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
      if (user) {
        // Chargement initial à la connexion uniquement — données fournies par authorize().
        // next-auth v5 beta ne type pas les champs custom dans JWT → cast explicite.
        //
        // COMPORTEMENT INTENTIONNEL — Permissions "stale" en session active :
        // Les permissions sont encodées dans le JWT à la connexion et ne sont PAS
        // rechargées depuis la DB à chaque requête (stratégie "jwt" sans DB lookup).
        // Si un admin modifie le rôle d'un utilisateur connecté, les nouvelles
        // permissions ne prendront effet qu'au prochain login de cet utilisateur.
        // Décision d'architecture : acceptée pour simplifier et éviter une requête DB
        // à chaque appel de `auth()`. Pour forcer le rechargement, l'utilisateur doit
        // se déconnecter/reconnecter, ou un admin peut invalider la session manuellement.
        token.id = user.id;
        (token as Record<string, unknown>).roleId = user.roleId ?? null;
        (token as Record<string, unknown>).roleName = user.roleName ?? null;
        (token as Record<string, unknown>).permissions = user.permissions ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roleId = (token.roleId as string | null) ?? null;
        session.user.roleName = (token.roleName as string | null) ?? null;
        session.user.permissions = (token.permissions as Array<{ resource: string; action: string }>) ?? [];
      }
      return session;
    },
  },
});
