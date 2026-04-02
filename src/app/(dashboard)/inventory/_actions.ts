"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional().transform((v) => v ?? null),
  quantity: z.coerce.number().int().min(0),
  unit: z.string().optional().transform((v) => v ?? null),
  minStock: z.coerce.number().int().min(0).optional().nullable().transform((v) => v ?? null),
  categoryId: z.string().min(1, "Catégorie requise"),
  activatedAt: z.string().optional().transform((v) => (v ? new Date(v) : null)),
  expiresAt: z.string().optional().transform((v) => (v ? new Date(v) : null)),
});

const categorySchema = z.object({
  name: z.string().min(1, "Nom requis"),
  icon: z.string().optional().transform((v) => v ?? null),
});

async function requirePermission(action: "create" | "update" | "delete" | "read") {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "inventory", action)) {
    throw new Error("Permission refusée");
  }
  return session;
}

// ─── Items ───────────────────────────────────────────────────────────────────

export async function createItem(formData: FormData) {
  await requirePermission("create");
  const data = itemSchema.parse(Object.fromEntries(formData));
  await prisma.inventoryItem.create({ data });
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateItem(id: string, formData: FormData) {
  await requirePermission("update");
  const data = itemSchema.parse(Object.fromEntries(formData));
  await prisma.inventoryItem.update({ where: { id }, data });
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function deleteItem(id: string) {
  await requirePermission("delete");
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/inventory");
}

// ─── Catégories ──────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  await requirePermission("create");
  const data = categorySchema.parse(Object.fromEntries(formData));
  await prisma.inventoryCategory.create({ data });
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateCategory(id: string, formData: FormData) {
  await requirePermission("update");
  const data = categorySchema.parse(Object.fromEntries(formData));
  await prisma.inventoryCategory.update({ where: { id }, data });
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function deleteCategory(id: string) {
  await requirePermission("delete");
  await prisma.inventoryCategory.delete({ where: { id } });
  revalidatePath("/inventory");
}
