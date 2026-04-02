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

async function log(action: string, itemName: string, userId: string, userName: string | null | undefined, details?: string) {
  await prisma.inventoryLog.create({
    data: { action, itemName, userId, userName: userName ?? null, details: details ?? null },
  });
}

// ─── Items ───────────────────────────────────────────────────────────────────

export async function createItem(formData: FormData) {
  const session = await requirePermission("create");
  const data = itemSchema.parse(Object.fromEntries(formData));
  await prisma.inventoryItem.create({ data });
  await log("CREATE", data.name, session.user.id, session.user.name, `Qté: ${data.quantity}${data.unit ? ` ${data.unit}` : ""}`);
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateItem(id: string, formData: FormData) {
  const session = await requirePermission("update");
  const data = itemSchema.parse(Object.fromEntries(formData));
  const prev = await prisma.inventoryItem.findUnique({ where: { id }, select: { name: true, quantity: true } });
  await prisma.inventoryItem.update({ where: { id }, data });
  const details = prev && prev.quantity !== data.quantity
    ? `Qté: ${prev.quantity} → ${data.quantity}`
    : "Infos modifiées";
  await log("UPDATE", data.name, session.user.id, session.user.name, details);
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function adjustQuantity(id: string, delta: number) {
  const session = await requirePermission("update");
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Article introuvable");
  const newQty = Math.max(0, item.quantity + delta);
  await prisma.inventoryItem.update({ where: { id }, data: { quantity: newQty } });
  await log(
    delta > 0 ? "QTY_ADD" : "QTY_SUB",
    item.name,
    session.user.id,
    session.user.name,
    `Qté: ${item.quantity} → ${newQty} (${delta > 0 ? "+" : ""}${delta})`
  );
  revalidatePath("/inventory");
}

export async function deleteItem(id: string) {
  const session = await requirePermission("delete");
  const item = await prisma.inventoryItem.findUnique({ where: { id }, select: { name: true } });
  await prisma.inventoryItem.delete({ where: { id } });
  await log("DELETE", item?.name ?? id, session.user.id, session.user.name);
  revalidatePath("/inventory");
}

// ─── Catégories ──────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const session = await requirePermission("create");
  const data = categorySchema.parse(Object.fromEntries(formData));
  await prisma.inventoryCategory.create({ data });
  await log("CATEGORY_CREATE", `[Catégorie] ${data.name}`, session.user.id, session.user.name);
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await requirePermission("update");
  const data = categorySchema.parse(Object.fromEntries(formData));
  await prisma.inventoryCategory.update({ where: { id }, data });
  await log("CATEGORY_UPDATE", `[Catégorie] ${data.name}`, session.user.id, session.user.name);
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function deleteCategory(id: string) {
  const session = await requirePermission("delete");
  const cat = await prisma.inventoryCategory.findUnique({ where: { id }, select: { name: true } });
  await prisma.inventoryCategory.delete({ where: { id } });
  await log("CATEGORY_DELETE", `[Catégorie] ${cat?.name ?? id}`, session.user.id, session.user.name);
  revalidatePath("/inventory");
}
