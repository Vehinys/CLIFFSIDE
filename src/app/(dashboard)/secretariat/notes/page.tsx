import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteNote } from "../_actions";

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const canWrite = canDo(session.user.permissions, "secretariat", "create");
  const canEdit = canDo(session.user.permissions, "secretariat", "update");
  const canDelete = canDo(session.user.permissions, "secretariat", "delete");

  const notes = await prisma.sharedNote.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/secretariat" className="text-muted hover:text-text text-sm">← Secrétariat</Link>
          <span className="text-border">/</span>
          <h1 className="text-xl font-bold text-text">Notes partagées</h1>
        </div>
        {canWrite && (
          <Link href="/secretariat/notes/new">
            <Button>+ Nouvelle note</Button>
          </Link>
        )}
      </div>

      {notes.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted">Aucune note partagée pour le moment.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {notes.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-text">{n.title}</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {n.createdByName ?? "—"} · modifié le {new Date(n.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-sm text-text/80 mt-2 line-clamp-3 whitespace-pre-wrap">{n.content}</p>
                </div>
              </div>
              {(canEdit || canDelete) && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-border/50">
                  {canEdit && (
                    <Link href={`/secretariat/notes/${n.id}/edit`} className="text-xs text-muted hover:text-text">Modifier</Link>
                  )}
                  {canDelete && (
                    <form action={deleteNote.bind(null, n.id)}>
                      <button type="submit" className="text-xs text-muted hover:text-danger">Supprimer</button>
                    </form>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
