"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const perishableSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional().transform((v) => v ?? null),
  quantity: z.coerce.number().int().min(0),
  unit: z.string().optional().transform((v) => v ?? null),
  category: z.string().optional().transform((v) => v ?? null),
  enteredAt: z.string().min(1, "Date d'entrée requise").transform((v) => new Date(v)),
  expiresAt: z.string().min(1, "Date d'expiration requise").transform((v) => new Date(v)),
});

async function requirePermission(action: "create" | "update" | "delete" | "read") {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "perishables", action)) {
    throw new Error("Permission refusée");
  }
  return session;
}

export async function createPerishable(formData: FormData) {
  const session = await requirePermission("create");
  const data = perishableSchema.parse(Object.fromEntries(formData));
  await prisma.perishableItem.create({
    data: { ...data, createdById: session.user.id, createdByName: session.user.name ?? null },
  });
  await audit(
    "perishables",
    "CREATE",
    data.name,
    session.user.id,
    session.user.name,
    `Qté: ${data.quantity}${data.unit ? ` ${data.unit}` : ""} — expire ${data.expiresAt.toLocaleDateString("fr-FR")}`
  );
  revalidatePath("/perishables");
  redirect("/perishables");
}

export async function updatePerishable(id: string, formData: FormData) {
  const session = await requirePermission("update");
  const data = perishableSchema.parse(Object.fromEntries(formData));
  const prev = await prisma.perishableItem.findUnique({
    where: { id },
    select: { expiresAt: true },
  });
  await prisma.perishableItem.update({ where: { id }, data });
  const details =
    prev && prev.expiresAt.getTime() !== data.expiresAt.getTime()
      ? `Expiration: ${prev.expiresAt.toLocaleDateString("fr-FR")} → ${data.expiresAt.toLocaleDateString("fr-FR")}`
      : "Infos modifiées";
  await audit("perishables", "UPDATE", data.name, session.user.id, session.user.name, details);
  revalidatePath("/perishables");
  redirect("/perishables");
}

export async function deletePerishable(
  id: string,
  _prevState: { error: string } | null,
  _formData: FormData
): Promise<{ error: string } | null> {
  try {
    const session = await requirePermission("delete");
    const item = await prisma.perishableItem.findUnique({ where: { id }, select: { name: true } });
    await prisma.perishableItem.delete({ where: { id } });
    await audit("perishables", "DELETE", item?.name ?? id, session.user.id, session.user.name);
    revalidatePath("/perishables");
    return null;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { error: e instanceof Error ? e.message : "Erreur lors de la suppression" };
  }
}
