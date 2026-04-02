"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

async function requirePermission(action: "create" | "update" | "delete" | "read") {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Non authentifié");
  }
  if (!canDo(session.user.permissions, "members", action)) {
    throw new Error("Permission refusée");
  }
  return session;
}

export async function deleteUserAccount(userId: string) {
  const session = await requirePermission("delete");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  await prisma.user.delete({ where: { id: userId } });
  await audit("members", "DELETE", user?.name ?? user?.email ?? userId, session.user.id, session.user.name);
  revalidatePath("/members");
}

export async function updateUserRole(userId: string, formData: FormData) {
  const session = await requirePermission("update");
  const roleId = formData.get("roleId") as string;

  const [user, role] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    roleId ? prisma.role.findUnique({ where: { id: roleId }, select: { name: true } }) : Promise.resolve(null),
  ]);

  await prisma.user.update({
    where: { id: userId },
    data: { roleId: roleId || null },
  });

  await audit(
    "members",
    "ROLE_UPDATE",
    user?.name ?? user?.email ?? userId,
    session.user.id,
    session.user.name,
    role ? `Rôle → ${role.name}` : "Rôle retiré"
  );
  revalidatePath("/members");
}
