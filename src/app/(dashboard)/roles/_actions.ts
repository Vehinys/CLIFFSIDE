"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo, RESOURCES, ACTIONS } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide"),
  description: z.string().optional(),
});

async function requirePermission(action: "create" | "update" | "delete" | "read") {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "roles", action)) {
    throw new Error("Permission refusée");
  }
  return session;
}

export async function createRole(formData: FormData) {
  const session = await requirePermission("create");
  const data = roleSchema.parse(Object.fromEntries(formData));

  const permissions = RESOURCES.flatMap((resource) =>
    ACTIONS.filter((action) => formData.get(`perm_${resource}_${action}`) === "on").map(
      (action) => ({ resource, action })
    )
  );

  const maxPos = await prisma.role.aggregate({ _max: { position: true } });
  const position = (maxPos._max.position ?? -1) + 1;

  await prisma.role.create({
    data: {
      ...data,
      position,
      description: data.description ?? null,
      permissions: { create: permissions },
    },
  });
  await audit("roles", "CREATE", data.name, session.user.id, session.user.name, `${permissions.length} permission(s)`);
  revalidatePath("/roles");
  redirect("/roles");
}

export async function updateRole(id: string, formData: FormData) {
  const session = await requirePermission("update");

  const role = await prisma.role.findUnique({ where: { id } });

  const raw = Object.fromEntries(formData);
  if (role?.isSystem) raw.name = role.name;

  const data = roleSchema.parse(raw);

  const permissions = RESOURCES.flatMap((resource) =>
    ACTIONS.filter((action) => formData.get(`perm_${resource}_${action}`) === "on").map(
      (action) => ({ resource, action })
    )
  );

  const categoryIds = formData.getAll("categoryIds").map(String).filter(Boolean);

  await prisma.role.update({
    where: { id },
    data: {
      ...data,
      description: data.description ?? null,
      permissions: {
        deleteMany: {},
        create: permissions,
      },
      inventoryCategories: {
        set: categoryIds.map((cid) => ({ id: cid })),
      },
    },
  });
  await audit("roles", "UPDATE", data.name, session.user.id, session.user.name, `${permissions.length} permission(s)`);
  revalidatePath("/roles");
  redirect("/roles");
}

export async function deleteRole(
  id: string,
  _prevState: { error: string } | null,
  _formData: FormData
): Promise<{ error: string } | null> {
  try {
    const session = await requirePermission("delete");
    const role = await prisma.role.findUnique({ where: { id } });
    if (role?.isSystem) return { error: "Impossible de supprimer un rôle système" };
    await prisma.role.delete({ where: { id } });
    await audit("roles", "DELETE", role?.name ?? id, session.user.id, session.user.name);
    revalidatePath("/roles");
    return null;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { error: e instanceof Error ? e.message : "Erreur lors de la suppression" };
  }
}

export async function moveRole(id: string, direction: "up" | "down") {
  const session = await requirePermission("update");

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new Error("Rôle introuvable");

  const allRoles = await prisma.role.findMany({
    orderBy: { position: "asc" },
  });

  const currentIndex = allRoles.findIndex((r) => r.id === id);
  if (currentIndex === -1) return;

  if (direction === "up" && currentIndex > 0) {
    const swapRole = allRoles[currentIndex - 1];
    await prisma.$transaction([
      prisma.role.update({ where: { id: role.id }, data: { position: swapRole.position } }),
      prisma.role.update({ where: { id: swapRole.id }, data: { position: role.position } }),
    ]);
  } else if (direction === "down" && currentIndex < allRoles.length - 1) {
    const swapRole = allRoles[currentIndex + 1];
    await prisma.$transaction([
      prisma.role.update({ where: { id: role.id }, data: { position: swapRole.position } }),
      prisma.role.update({ where: { id: swapRole.id }, data: { position: role.position } }),
    ]);
  }

  revalidatePath("/members");
  revalidatePath("/roles");
}
