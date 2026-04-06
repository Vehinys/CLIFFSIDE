import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPseudo } from "@/components/ui/user-pseudo";

const STATUS_META = {
  TODO:        { label: "À faire",    variant: "default"  as const },
  IN_PROGRESS: { label: "En cours",   variant: "warning"  as const },
  DONE:        { label: "Terminé",    variant: "success"  as const },
};

export default async function SecretariatPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "read")) redirect("/dashboard");

  const [announcements, reports, notes, tasks] = await Promise.all([
    prisma.announcement.findMany({
      include: { createdBy: { include: { role: { select: { color: true } } } } },
      orderBy: { createdAt: "desc" }, take: 3,
    }),
    prisma.meetingReport.findMany({ orderBy: { meetingDate: "desc" }, take: 3 }),
    prisma.sharedNote.findMany({ orderBy: { updatedAt: "desc" }, take: 3 }),
    prisma.secretariatTask.findMany({
      include: { assignedTo: { include: { role: { select: { color: true } } } } },
      where: { status: { not: "DONE" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Secrétariat</h1>
        <p className="text-sm text-muted mt-1">Annonces, comptes-rendus, notes et tâches de l&apos;organisation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annonces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Annonces</span>
              <Link href="/secretariat/announcements" className="text-xs font-normal text-primary hover:underline">Voir tout →</Link>
            </CardTitle>
          </CardHeader>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted italic">Aucune annonce.</p>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="border-b border-border/50 last:border-0 pb-3 last:pb-0">
                  <p className="font-medium text-sm text-text">{a.title}</p>
                  <p className="text-xs text-muted line-clamp-2 mt-0.5">{a.content}</p>
                  <p className="text-xs text-muted/60 mt-1"><UserPseudo name={a.createdByName} color={a.createdBy?.role?.color} className="text-inherit" /> · {new Date(a.createdAt).toLocaleDateString("fr-FR")}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Comptes-rendus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Comptes-rendus</span>
              <Link href="/secretariat/reports" className="text-xs font-normal text-primary hover:underline">Voir tout →</Link>
            </CardTitle>
          </CardHeader>
          {reports.length === 0 ? (
            <p className="text-sm text-muted italic">Aucun compte-rendu.</p>
          ) : (
            <ul className="space-y-2">
              {reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                  <span className="text-text font-medium">{r.title}</span>
                  <span className="text-xs text-muted">{new Date(r.meetingDate).toLocaleDateString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Notes partagées</span>
              <Link href="/secretariat/notes" className="text-xs font-normal text-primary hover:underline">Voir tout →</Link>
            </CardTitle>
          </CardHeader>
          {notes.length === 0 ? (
            <p className="text-sm text-muted italic">Aucune note.</p>
          ) : (
            <ul className="space-y-2">
              {notes.map((n) => (
                <li key={n.id} className="text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                  <p className="font-medium text-text">{n.title}</p>
                  <p className="text-xs text-muted/60">Modifié le {new Date(n.updatedAt).toLocaleDateString("fr-FR")}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Tâches ouvertes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tâches en cours</span>
              <Link href="/secretariat/tasks" className="text-xs font-normal text-primary hover:underline">Voir tout →</Link>
            </CardTitle>
          </CardHeader>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted italic">Aucune tâche ouverte.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                  <div>
                    <span className="text-text font-medium">{t.title}</span>
                    {t.assignedToName && <span className="ml-2 text-xs text-muted">→ <UserPseudo name={t.assignedToName} color={t.assignedTo?.role?.color} className="text-inherit" /></span>}
                  </div>
                  <Badge variant={STATUS_META[t.status].variant}>{STATUS_META[t.status].label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
