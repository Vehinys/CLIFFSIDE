import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TasksList } from "./_components/tasks-list";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const canWrite = canDo(session.user.permissions, "secretariat", "create");
  const canEdit = canDo(session.user.permissions, "secretariat", "update");
  const canDelete = canDo(session.user.permissions, "secretariat", "delete");

  const tasks = await prisma.secretariatTask.findMany({ 
    include: {
      createdBy: { include: { role: { select: { color: true } } } },
      assignedTo: { include: { role: { select: { color: true } } } },
    },
    orderBy: { createdAt: "desc" } 
  });

  const members = canDo(session.user.permissions, "members", "read")
    ? (await prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/secretariat" className="text-muted hover:text-text text-sm">← Secrétariat</Link>
          <span className="text-border">/</span>
          <h1 className="text-xl font-bold text-text">Tâches</h1>
        </div>
      </div>

      <TasksList 
        tasks={tasks} 
        members={members} 
        canWrite={canWrite} 
        canEdit={canEdit} 
        canDelete={canDelete} 
      />
    </div>
  );
}
