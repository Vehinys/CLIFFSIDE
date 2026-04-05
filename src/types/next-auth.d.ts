import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string | null;
      roleName: string | null;
      isSuperAdmin: boolean;
      permissions: Array<{ resource: string; action: string }>;
    } & DefaultSession["user"];
  }

  // Étend le type User pour inclure les champs custom retournés par authorize()
  // Note: next-auth v5 beta ne propage pas ces champs dans JWT automatiquement
  // → cast explicite requis dans le callback jwt (voir auth.ts)
  interface User {
    roleId?: string | null;
    roleName?: string | null;
    isSuperAdmin?: boolean;
    permissions?: Array<{ resource: string; action: string }>;
  }
}
