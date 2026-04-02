import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string | null;
      roleName: string | null;
      permissions: Array<{ resource: string; action: string }>;
    } & DefaultSession["user"];
  }
}
