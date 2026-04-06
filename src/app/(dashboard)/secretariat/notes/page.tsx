import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteNote } from "../_actions";
import { SearchInput } from "@/components/ui/search-input";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function NotesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const { search } = await searchParams;

  const canWrite = canDo(session.user.permissions, "secretariat", "create");
  const canEdit = canDo(session.user.permissions, "secretariat", "update");
  const canDelete = canDo(session.user.permissions, "secretariat", "delete");

  const notes = await prisma.sharedNote.findMany({
    ...(search ? {
      where: {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
    } : {}),
    orderBy: { updatedAt: "desc" },
  });

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

      <SearchInput placeholder="Rechercher une note…" />

      {notes.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted">{search ? "Aucun résultat." : "Aucune note partagée pour le moment."}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {notes.map((n) => (
            <Card key={n.id} className="flex flex-col">
              <div className="flex items-start gap-4 flex-1">
                {n.imageUrl && (
                  <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg border border-white/10 bg-surface/50 overflow-hidden flex items-center justify-center p-1.5 mt-1">
                    <Image
                      src={n.imageUrl}
                      alt=""
                      width={200}
                      height={200}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-text">{n.title}</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {n.createdByName ?? "—"} · modifié le {new Date(n.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="text-sm text-text/80 mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap pr-1">
                    {n.content}
                  </div>
                </div>
              </div>
              {(canEdit || canDelete) && (
                <div className="flex gap-3 mt-4 pt-3 border-t border-border/50">
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
