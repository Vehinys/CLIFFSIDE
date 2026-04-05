import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteAnnouncement } from "../_actions";
import { SearchInput } from "@/components/ui/search-input";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const { search } = await searchParams;

  const canWrite = canDo(session.user.permissions, "secretariat", "create");
  const canEdit = canDo(session.user.permissions, "secretariat", "update");
  const canDelete = canDo(session.user.permissions, "secretariat", "delete");

  const announcements = await prisma.announcement.findMany({
    ...(search ? {
      where: {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
    } : {}),
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/secretariat" className="text-muted hover:text-text text-sm">← Secrétariat</Link>
          <span className="text-border">/</span>
          <h1 className="text-xl font-bold text-text">Annonces</h1>
        </div>
        {canWrite && (
          <Link href="/secretariat/announcements/new">
            <Button>+ Nouvelle annonce</Button>
          </Link>
        )}
      </div>

      <SearchInput placeholder="Rechercher une annonce…" />

      {announcements.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted">{search ? "Aucun résultat." : "Aucune annonce pour le moment."}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-text">{a.title}</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {a.createdByName ?? "—"} · {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                  <div className="text-sm text-text/80 mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap pr-1">
                    {a.content}
                  </div>
                  {a.imageUrl && (
                    <img
                      src={a.imageUrl}
                      alt=""
                      className="mt-3 rounded-md max-h-64 object-contain border border-border"
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {canEdit && (
                    <Link href={`/secretariat/announcements/${a.id}/edit`} className="text-xs text-muted hover:text-text transition-colors">Modifier</Link>
                  )}
                  {canDelete && (
                    <form action={deleteAnnouncement.bind(null, a.id)}>
                      <button type="submit" className="text-xs text-muted hover:text-danger transition-colors">Supprimer</button>
                    </form>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
