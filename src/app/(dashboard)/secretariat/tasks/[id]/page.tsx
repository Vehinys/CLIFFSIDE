import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPseudo } from "@/components/ui/user-pseudo";

const STATUS_META = {
  TODO:        { label: "À faire",  variant: "default"  as const },
  IN_PROGRESS: { label: "En cours", variant: "warning"  as const },
  DONE:        { label: "Terminé",  variant: "success"  as const },
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const task = await prisma.secretariatTask.findUnique({
    where: { id },
    include: {
      createdBy: { include: { role: { select: { color: true } } } },
      assignedTo: { include: { role: { select: { color: true } } } },
    },
  });
  if (!task) notFound();

  const canEdit = canDo(session.user.permissions, "secretariat", "update");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/secretariat/tasks" className="text-muted hover:text-text text-sm">← Tâches</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text truncate">{task.title}</h1>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_META[task.status].variant}>{STATUS_META[task.status].label}</Badge>
          {task.assignedToName && (
            <span className="text-sm text-muted">→ <UserPseudo name={task.assignedToName} color={task.assignedTo?.role?.color} className="text-inherit" /></span>
          )}
        </div>

        {task.description ? (
          <div className="text-sm text-text/90 whitespace-pre-wrap leading-relaxed">
            {task.description}
          </div>
        ) : (
          <p className="text-sm text-muted italic">Aucune description.</p>
        )}

        <p className="text-xs text-muted pt-2 border-t border-border/50">
          Créée par <UserPseudo name={task.createdByName} color={task.createdBy?.role?.color} className="text-inherit" /> · {new Date(task.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>

        {canEdit && (
          <div className="pt-1">
            <Link href={`/secretariat/tasks/${task.id}/edit`} className="text-xs text-primary hover:underline">Modifier cette tâche</Link>
          </div>
        )}
      </Card>
    </div>
  );
}
