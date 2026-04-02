"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
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

export async function deleteUserAccount(userId: string) {
  await requirePermission("delete");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/members");
}

export async function updateUserRole(userId: string, formData: FormData) {
  await requirePermission("update"); 
  const roleId = formData.get("roleId") as string;
  
  await prisma.user.update({
    where: { id: userId },
    data: { roleId: roleId || null },
  });
  
  revalidatePath("/members");
}
