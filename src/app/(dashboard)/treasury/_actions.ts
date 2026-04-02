"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
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
  revalidatePath("/treasury");
  redirect("/treasury");
}

export async function updateTransaction(id: string, formData: FormData) {
  await requirePermission("update");
  const data = transactionSchema.parse(Object.fromEntries(formData));
  await prisma.treasuryTransaction.update({ where: { id }, data });
  revalidatePath("/treasury");
  redirect("/treasury");
}

export async function deleteTransaction(id: string) {
  await requirePermission("delete");
  await prisma.treasuryTransaction.delete({ where: { id } });
  revalidatePath("/treasury");
}
