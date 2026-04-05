import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateTaskStatus, deleteTask } from "../_actions";

const STATUS_META = {
  TODO:        { label: "À faire",  variant: "default"  as const },
  IN_PROGRESS: { label: "En cours", variant: "warning"  as const },
  DONE:        { label: "Terminé",  variant: "success"  as const },
};

const NEXT_STATUS: Record<"TODO" | "IN_PROGRESS" | "DONE", "TODO" | "IN_PROGRESS" | "DONE"> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const canWrite = canDo(session.user.permissions, "secretariat", "create");
  const canEdit = canDo(session.user.permissions, "secretariat", "update");
  const canDelete = canDo(session.user.permissions, "secretariat", "delete");

  const tasks = await prisma.secretariatTask.findMany({ orderBy: { createdAt: "desc" } });

  const grouped = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/secretariat" className="text-muted hover:text-text text-sm">← Secrétariat</Link>
          <span className="text-border">/</span>
          <h1 className="text-xl font-bold text-text">Tâches</h1>
        </div>
        {canWrite && (
          <Link href="/secretariat/tasks/new">
            <Button>+ Nouvelle tâche</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Badge variant={STATUS_META[status].variant}>{STATUS_META[status].label}</Badge>
                <span className="text-muted font-normal">({grouped[status].length})</span>
              </CardTitle>
            </CardHeader>
            {grouped[status].length === 0 ? (
              <p className="text-xs text-muted italic">Aucune tâche.</p>
            ) : (
              <ul className="space-y-3">
                {grouped[status].map((t) => (
                  <li key={t.id} className="border border-border/50 rounded-md p-2.5 bg-surface-2/50">
                    <Link href={`/secretariat/tasks/${t.id}`} className="font-medium text-sm text-text hover:text-primary transition-colors">{t.title}</Link>
                    {t.description && <p className="text-xs text-muted mt-0.5 line-clamp-2">{t.description}</p>}
                    {t.assignedToName && (
                      <p className="text-xs text-muted mt-1">→ {t.assignedToName}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {canEdit && status !== "DONE" && (
                        <form action={updateTaskStatus.bind(null, t.id, NEXT_STATUS[status])}>
                          <button type="submit" className="text-xs text-primary hover:underline">
                            {status === "TODO" ? "Démarrer →" : "Terminer →"}
                          </button>
                        </form>
                      )}
                      {canEdit && (
                        <Link href={`/secretariat/tasks/${t.id}/edit`} className="text-xs text-muted hover:text-text ml-auto">Modifier</Link>
                      )}
                      {canDelete && (
                        <form action={deleteTask.bind(null, t.id)}>
                          <button type="submit" className="text-xs text-muted hover:text-danger">Supprimer</button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
