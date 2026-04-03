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

function tomorrowMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

async function getOrCreateSession(date: Date) {
  return prisma.dailySession.upsert({
    where: { date },
    create: { date },
    update: {},
  });
}

export async function respondAttendance(status: "PRESENT" | "ABSENT") {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dailySession = await getOrCreateSession(todayMidnight());

  await prisma.dailyAttendance.upsert({
    where: { sessionId_userId: { sessionId: dailySession.id, userId: session.user.id } },
    create: { sessionId: dailySession.id, userId: session.user.id, userName: session.user.name ?? null, status },
    update: { status, userName: session.user.name ?? null },
  });

  revalidatePath("/dashboard");
}

export async function createObjective(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "objectives", "create")) throw new Error("Permission refusée");

  const content = (formData.get("content") as string)?.trim();
  if (!content) return;

  const forTomorrow = formData.get("day") === "tomorrow";
  const date = forTomorrow ? tomorrowMidnight() : todayMidnight();

  const dailySession = await getOrCreateSession(date);

  await prisma.dailyObjective.create({
    data: {
      sessionId: dailySession.id,
      content,
      createdById: session.user.id,
      createdByName: session.user.name ?? null,
    },
  });

  revalidatePath("/dashboard");
}

export async function toggleObjectiveDone(id: string, done: boolean) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "objectives", "update")) throw new Error("Permission refusée");

  await prisma.dailyObjective.update({ where: { id }, data: { done } });
  revalidatePath("/dashboard");
}

export async function deleteObjective(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "objectives", "delete")) throw new Error("Permission refusée");

  await prisma.dailyObjective.delete({ where: { id } });
  revalidatePath("/dashboard");
}
