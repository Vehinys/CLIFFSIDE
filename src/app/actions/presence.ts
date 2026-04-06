"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function pingOnlineStatus() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastSeen: new Date() },
  });
}
