"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getOrCreateSession(date: Date) {
  return prisma.dailySession.upsert({
    where: { date },
    create: { date },
    update: {},
  });
}

export async function setMemberAttendance(
  userId: string,
  status: "PRESENT" | "ABSENT" | "LATE"
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const canManage =
    canDo(session.user.permissions, "members", "update") ||
    session.user.isSuperAdmin;

  if (!canManage) throw new Error("Permission refusée");

  const dailySession = await getOrCreateSession(todayMidnight());

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  await prisma.dailyAttendance.upsert({
    where: { sessionId_userId: { sessionId: dailySession.id, userId } },
    create: {
      sessionId: dailySession.id,
      userId,
      userName: user?.name ?? user?.email ?? null,
      status,
    },
    update: { status, userName: user?.name ?? user?.email ?? null },
  });

  revalidatePath("/presences");
}
