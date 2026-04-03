import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateTask } from "../../../_actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "update")) redirect("/secretariat/tasks");

  const [task, members] = await Promise.all([
    prisma.secretariatTask.findUnique({ where: { id } }),
    canDo(session.user.permissions, "members", "read")
      ? prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: "asc" } })
      : [],
  ]);
  if (!task) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/secretariat/tasks" className="text-muted hover:text-text text-sm">← Tâches</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Modifier la tâche</h1>
      </div>

      <form action={updateTask.bind(null, id)} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="title" required>Titre</Label>
          <Input id="title" name="title" defaultValue={task.title} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={task.description ?? ""} rows={3} />
        </div>
        <div>
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            name="status"
            defaultValue={task.status}
            className="w-full h-10 rounded-md border border-border bg-surface-2 px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <option value="TODO">À faire</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="DONE">Terminé</option>
          </select>
        </div>
        {members.length > 0 && (
          <div>
            <Label htmlFor="assignedToId">Assigner à</Label>
            <select
              id="assignedToId"
              name="assignedToId"
              defaultValue={task.assignedToId ?? ""}
              className="w-full h-10 rounded-md border border-border bg-surface-2 px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <option value="">— Non assigné —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/secretariat/tasks"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
