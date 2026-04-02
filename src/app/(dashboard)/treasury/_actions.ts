"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().int().positive("Le montant doit être positif"),
  description: z.string().min(1, "Description requise"),
  category: z.string().optional().transform((v) => v ?? null),
});

async function requirePermission(action: "create" | "update" | "delete" | "read") {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "treasury", action)) {
    throw new Error("Permission refusée");
  }
  return session;
}

export async function createTransaction(formData: FormData) {
  const session = await requirePermission("create");
  const data = transactionSchema.parse(Object.fromEntries(formData));
  await prisma.treasuryTransaction.create({
    data: { ...data, createdById: session.user.id },
  });
  await audit(
    "treasury",
    "CREATE",
    data.description,
    session.user.id,
    session.user.name,
    `${data.type === "INCOME" ? "+" : "-"}${data.amount}$${data.category ? ` (${data.category})` : ""}`
  );
  revalidatePath("/treasury");
  redirect("/treasury");
}

export async function updateTransaction(id: string, formData: FormData) {
  const session = await requirePermission("update");
  const data = transactionSchema.parse(Object.fromEntries(formData));
  const prev = await prisma.treasuryTransaction.findUnique({ where: { id }, select: { amount: true } });
  await prisma.treasuryTransaction.update({ where: { id }, data });
  const details = prev && prev.amount !== data.amount
    ? `Montant: ${prev.amount}$ → ${data.amount}$`
    : "Infos modifiées";
  await audit("treasury", "UPDATE", data.description, session.user.id, session.user.name, details);
  revalidatePath("/treasury");
  redirect("/treasury");
}

export async function deleteTransaction(id: string) {
  const session = await requirePermission("delete");
  const tx = await prisma.treasuryTransaction.findUnique({ where: { id }, select: { description: true, amount: true, type: true } });
  await prisma.treasuryTransaction.delete({ where: { id } });
  await audit(
    "treasury",
    "DELETE",
    tx?.description ?? id,
    session.user.id,
    session.user.name,
    tx ? `${tx.type === "INCOME" ? "+" : "-"}${tx.amount}$` : undefined
  );
  revalidatePath("/treasury");
}
