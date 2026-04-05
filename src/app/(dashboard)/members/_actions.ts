"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requirePermission(action: "create" | "update" | "delete" | "read") {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "members", action)) {
    throw new Error("Permission refusée");
  }
  return session;
}

export async function deleteUserAccount(
  userId: string,
  _prevState: { error: string } | null,
  _formData: FormData
): Promise<{ error: string } | null> {
  try {
    const session = await requirePermission("delete");

    if (userId === session.user.id) {
      return { error: "Impossible de supprimer son propre compte" };
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, isSuperAdmin: true, role: { select: { isSystem: true } } },
    });

    if (userToDelete?.isSuperAdmin) {
      return { error: "Impossible de supprimer ce compte" };
    }

    if (userToDelete?.role?.isSystem) {
      const systemAdminCount = await prisma.user.count({
        where: { role: { isSystem: true } },
      });
      if (systemAdminCount <= 1) {
        return { error: "Impossible de supprimer le dernier administrateur système" };
      }
    }

    await prisma.user.delete({ where: { id: userId } });
    await audit("members", "DELETE", userToDelete?.name ?? userToDelete?.email ?? userId, session.user.id, session.user.name);
    revalidatePath("/members");
    return null;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { error: e instanceof Error ? e.message : "Erreur lors de la suppression" };
  }
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
