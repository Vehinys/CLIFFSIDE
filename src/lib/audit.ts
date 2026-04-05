"use server";

import { prisma } from "@/lib/prisma";

export async function audit(
  section: "inventory" | "treasury" | "members" | "roles" | "objectives" | "secretariat" | "perishables",
  action: string,
  targetName: string,
  userId: string,
  userName: string | null | undefined,
  details?: string
) {
  await prisma.auditLog.create({
    data: {
      section,
      action,
      targetName,
      userId,
      userName: userName ?? null,
      details: details ?? null,
    },
  });
}
