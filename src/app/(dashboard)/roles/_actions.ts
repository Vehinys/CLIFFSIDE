"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo, RESOURCES, ACTIONS } from "@/lib/permissions";
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
  await requirePermission("create");
  const data = roleSchema.parse(Object.fromEntries(formData));

  const permissions = RESOURCES.flatMap((resource) =>
    ACTIONS.filter((action) => formData.get(`perm_${resource}_${action}`) === "on").map(
      (action) => ({ resource, action })
    )
  );

  await prisma.role.create({
    data: {
      ...data,
      description: data.description || null,
      permissions: { create: permissions },
    },
  });
  revalidatePath("/roles");
  redirect("/roles");
}

export async function updateRole(id: string, formData: FormData) {
  await requirePermission("update");

  const role = await prisma.role.findUnique({ where: { id } });

  const raw = Object.fromEntries(formData);
  // Pour les rôles système, on garde le nom existant
  if (role?.isSystem) raw.name = role.name;

  const data = roleSchema.parse(raw);

  const permissions = RESOURCES.flatMap((resource) =>
    ACTIONS.filter((action) => formData.get(`perm_${resource}_${action}`) === "on").map(
      (action) => ({ resource, action })
    )
  );

  await prisma.role.update({
    where: { id },
    data: {
      ...data,
      description: data.description || null,
      permissions: {
        deleteMany: {},
        create: permissions,
      },
    },
  });
  revalidatePath("/roles");
  redirect("/roles");
}

export async function deleteRole(id: string) {
  await requirePermission("delete");
  const role = await prisma.role.findUnique({ where: { id } });
  if (role?.isSystem) throw new Error("Impossible de supprimer un rôle système");
  await prisma.role.delete({ where: { id } });
  revalidatePath("/roles");
}
