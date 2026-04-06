"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function requirePermission(action: "create" | "update" | "delete" | "read") {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", action)) throw new Error("Permission refusée");
  return session;
}

// ─── Annonces ────────────────────────────────────────────────────────────────

const announcementSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  content: z.string().min(1, "Contenu requis"),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")).transform((v) => v || null),
});

export async function createAnnouncement(formData: FormData) {
  try {
    const session = await requirePermission("create");
    const data = announcementSchema.parse(Object.fromEntries(formData));
    await prisma.announcement.create({
      data: { ...data, createdById: session.user.id, createdByName: session.user.name ?? null },
    });
    await audit("secretariat", "ANNOUNCE_CREATE", data.title, session.user.id, session.user.name);
    revalidatePath("/secretariat/announcements");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur de création" };
  }
}

export async function updateAnnouncement(id: string, formData: FormData) {
  try {
    const session = await requirePermission("update");
    const data = announcementSchema.parse(Object.fromEntries(formData));
    await prisma.announcement.update({ where: { id }, data });
    await audit("secretariat", "ANNOUNCE_UPDATE", data.title, session.user.id, session.user.name);
    revalidatePath("/secretariat/announcements");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur de mise à jour" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const session = await requirePermission("delete");
    const item = await prisma.announcement.findUnique({ where: { id }, select: { title: true } });
    await prisma.announcement.delete({ where: { id } });
    await audit("secretariat", "ANNOUNCE_DELETE", item?.title ?? id, session.user.id, session.user.name);
    revalidatePath("/secretariat/announcements");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression" };
  }
}

// ─── Comptes-rendus ───────────────────────────────────────────────────────────

const reportSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  content: z.string().min(1, "Contenu requis"),
  meetingDate: z.string().min(1, "Date requise").transform((v) => new Date(v)),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")).transform((v) => v || null),
});

export async function createReport(formData: FormData) {
  try {
    const session = await requirePermission("create");
    const data = reportSchema.parse(Object.fromEntries(formData));
    await prisma.meetingReport.create({
      data: { ...data, createdById: session.user.id, createdByName: session.user.name ?? null },
    });
    await audit("secretariat", "REPORT_CREATE", data.title, session.user.id, session.user.name);
    revalidatePath("/secretariat/reports");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur de création" };
  }
}

export async function updateReport(id: string, formData: FormData) {
  try {
    const session = await requirePermission("update");
    const data = reportSchema.parse(Object.fromEntries(formData));
    await prisma.meetingReport.update({ where: { id }, data });
    await audit("secretariat", "REPORT_UPDATE", data.title, session.user.id, session.user.name);
    revalidatePath("/secretariat/reports");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur de mise à jour" };
  }
}

export async function deleteReport(id: string) {
  try {
    const session = await requirePermission("delete");
    const item = await prisma.meetingReport.findUnique({ where: { id }, select: { title: true } });
    await prisma.meetingReport.delete({ where: { id } });
    await audit("secretariat", "REPORT_DELETE", item?.title ?? id, session.user.id, session.user.name);
    revalidatePath("/secretariat/reports");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression" };
  }
}

// ─── Notes partagées ──────────────────────────────────────────────────────────

const noteSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  content: z.string().min(1, "Contenu requis"),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")).transform((v) => v || null),
});

export async function createNote(formData: FormData) {
  try {
    const session = await requirePermission("create");
    const data = noteSchema.parse(Object.fromEntries(formData));
    await prisma.sharedNote.create({
      data: { ...data, createdById: session.user.id, createdByName: session.user.name ?? null },
    });
    await audit("secretariat", "NOTE_CREATE", data.title, session.user.id, session.user.name);
    revalidatePath("/secretariat/notes");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur" };
  }
}

export async function updateNote(id: string, formData: FormData) {
  try {
    const session = await requirePermission("update");
    const data = noteSchema.parse(Object.fromEntries(formData));
    await prisma.sharedNote.update({ where: { id }, data });
    await audit("secretariat", "NOTE_UPDATE", data.title, session.user.id, session.user.name);
    revalidatePath("/secretariat/notes");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur" };
  }
}

export async function deleteNote(id: string) {
  try {
    const session = await requirePermission("delete");
    const item = await prisma.sharedNote.findUnique({ where: { id }, select: { title: true } });
    await prisma.sharedNote.delete({ where: { id } });
    await audit("secretariat", "NOTE_DELETE", item?.title ?? id, session.user.id, session.user.name);
    revalidatePath("/secretariat/notes");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression" };
  }
}

// ─── Tâches ───────────────────────────────────────────────────────────────────

const taskSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional().transform((v) => v || null),
  assignedToId: z.string().optional().transform((v) => v || null),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
});

export async function createTask(formData: FormData) {
  try {
    const session = await requirePermission("create");
    const data = taskSchema.parse(Object.fromEntries(formData));
    const assignedUser = data.assignedToId
      ? await prisma.user.findUnique({ where: { id: data.assignedToId }, select: { name: true, email: true } })
      : null;
    const assignedToName = assignedUser ? (assignedUser.name ?? assignedUser.email) : null;
    await prisma.secretariatTask.create({
      data: { ...data, assignedToName, createdById: session.user.id, createdByName: session.user.name ?? null },
    });
    await audit("secretariat", "TASK_CREATE", data.title, session.user.id, session.user.name,
      assignedToName ? `Assigné à ${assignedToName}` : undefined);
    revalidatePath("/secretariat/tasks");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur" };
  }
}

export async function updateTask(id: string, formData: FormData) {
  try {
    const session = await requirePermission("update");
    const data = taskSchema.parse(Object.fromEntries(formData));
    const assignedUser = data.assignedToId
      ? await prisma.user.findUnique({ where: { id: data.assignedToId }, select: { name: true, email: true } })
      : null;
    const assignedToName = assignedUser ? (assignedUser.name ?? assignedUser.email) : null;
    await prisma.secretariatTask.update({ where: { id }, data: { ...data, assignedToName } });
    await audit("secretariat", "TASK_UPDATE", data.title, session.user.id, session.user.name, `Statut: ${data.status}`);
    revalidatePath("/secretariat/tasks");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur" };
  }
}

export async function updateTaskStatus(id: string, status: "TODO" | "IN_PROGRESS" | "DONE") {
  try {
    const session = await requirePermission("update");
    const task = await prisma.secretariatTask.findUnique({ where: { id }, select: { title: true } });
    await prisma.secretariatTask.update({ where: { id }, data: { status } });
    await audit("secretariat", "TASK_UPDATE", task?.title ?? id, session.user.id, session.user.name, `Statut → ${status}`);
    revalidatePath("/secretariat/tasks");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la mise à jour" };
  }
}

export async function deleteTask(id: string) {
  try {
    const session = await requirePermission("delete");
    const item = await prisma.secretariatTask.findUnique({ where: { id }, select: { title: true } });
    await prisma.secretariatTask.delete({ where: { id } });
    await audit("secretariat", "TASK_DELETE", item?.title ?? id, session.user.id, session.user.name);
    revalidatePath("/secretariat/tasks");
    return null;
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression" };
  }
}
