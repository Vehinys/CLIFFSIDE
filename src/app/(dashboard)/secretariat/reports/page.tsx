import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteReport } from "../_actions";
import { SearchInput } from "@/components/ui/search-input";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const { search } = await searchParams;

  const canWrite = canDo(session.user.permissions, "secretariat", "create");
  const canEdit = canDo(session.user.permissions, "secretariat", "update");
  const canDelete = canDo(session.user.permissions, "secretariat", "delete");

  const reports = await prisma.meetingReport.findMany({
    where: search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    } : undefined,
    orderBy: { meetingDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/secretariat" className="text-muted hover:text-text text-sm">← Secrétariat</Link>
          <span className="text-border">/</span>
          <h1 className="text-xl font-bold text-text">Comptes-rendus</h1>
        </div>
        {canWrite && (
          <Link href="/secretariat/reports/new">
            <Button>+ Nouveau compte-rendu</Button>
          </Link>
        )}
      </div>

      <SearchInput placeholder="Rechercher un compte-rendu…" />

      {reports.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted">{search ? "Aucun résultat." : "Aucun compte-rendu pour le moment."}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-text">{r.title}</h2>
                    <span className="text-xs text-muted border border-border rounded px-2 py-0.5">
                      {new Date(r.meetingDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Rédigé par {r.createdByName ?? "—"}</p>
                  <div className="text-sm text-text/80 mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap pr-1">
                    {r.content}
                  </div>
                  {r.imageUrl && (
                    <img
                      src={r.imageUrl}
                      alt=""
                      className="mt-3 rounded-md max-h-64 object-contain border border-border"
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {canEdit && (
                    <Link href={`/secretariat/reports/${r.id}/edit`} className="text-xs text-muted hover:text-text transition-colors">Modifier</Link>
                  )}
                  {canDelete && (
                    <form action={deleteReport.bind(null, r.id)}>
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
