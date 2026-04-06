import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function PresencesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // On peut s'assurer que c'est une personne autorisée, par exemple membre ou secrétariat
  const canReadMembers = canDo(session.user.permissions, "members", "read");
  if (!canReadMembers) redirect("/dashboard");

  const [users, dailySession] = await Promise.all([
    prisma.user.findMany({ include: { role: true }, orderBy: { lastSeen: "desc" } }),
    prisma.dailySession.findUnique({
      where: { date: todayMidnight() },
      include: { attendances: true },
    }),
  ]);

  const now = new Date();
  const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-text">Présences & Activité</h1>
          <p className="text-sm text-muted mt-1">Sachez en temps réel qui est en ligne et leurs présences pour ce soir.</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted">Membre</th>
                <th className="pb-3 font-medium text-muted">Rôle</th>
                <th className="pb-3 font-medium text-muted">Statut en ligne</th>
                <th className="pb-3 font-medium text-muted">Présence (Session du soir)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isOnline = u.lastSeen && now.getTime() - u.lastSeen.getTime() <= ONLINE_THRESHOLD;
                const attendance = dailySession?.attendances.find((a) => a.userId === u.id);

                return (
                  <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-surface-2/50 transition-colors duration-150">
                    <td className="py-3 font-medium text-text">{u.name ?? u.email}</td>
                    <td className="py-3">
                      <Badge color={u.role?.color ?? undefined}>{u.role?.name ?? "Aucun rôle"}</Badge>
                    </td>
                    <td className="py-3">
                      {isOnline ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          <span className="text-success font-medium text-xs">En ligne</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted text-xs">
                          <span className="w-2 h-2 rounded-full bg-surface-2" />
                          {u.lastSeen ? `Vu(e) le ${formatDate(u.lastSeen)}` : "Jamais connecté"}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {attendance ? (
                        <Badge variant={attendance.status === "PRESENT" ? "success" : "danger"}>
                          {attendance.status === "PRESENT" ? "Présent" : "Absent"}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-surface-2 text-muted border-border">
                          En attente
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
