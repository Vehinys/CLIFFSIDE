import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { setMemberAttendance } from "./_actions";

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const ATTENDANCE_META = {
  PRESENT: { label: "Présent",   variant: "success"  as const },
  ABSENT:  { label: "Absent",    variant: "danger"   as const },
  LATE:    { label: "En retard", variant: "warning"  as const },
};

export default async function PresencesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const canReadMembers = canDo(session.user.permissions, "members", "read");
  if (!canReadMembers) redirect("/dashboard");

  const canManage =
    canDo(session.user.permissions, "members", "update") ||
    session.user.isSuperAdmin;

  const today = todayMidnight();

  // Historique sur les 7 derniers jours (inclut aujourd'hui)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [users, dailySession, pastSessions] = await Promise.all([
    prisma.user.findMany({ include: { role: true }, orderBy: { name: "asc" } }),
    prisma.dailySession.findUnique({
      where: { date: today },
      include: { attendances: true },
    }),
    prisma.dailySession.findMany({
      where: { date: { gte: sevenDaysAgo, lt: today } },
      include: { attendances: { select: { userId: true, status: true } } },
      orderBy: { date: "desc" },
      take: 6,
    }),
  ]);

  const now = new Date();
  const ONLINE_THRESHOLD = 5 * 60 * 1000;

  // Trier les sessions passées du plus récent au plus ancien
  const sortedPastSessions = [...pastSessions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-text">Présences & Activité</h1>
          <p className="text-sm text-muted mt-1">
            Sachez en temps réel qui est en ligne et leurs présences pour ce soir.
          </p>
        </div>
      </div>

      {/* ─── Présences du soir ─── */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted">Membre</th>
                <th className="pb-3 font-medium text-muted">Rôle</th>
                <th className="pb-3 font-medium text-muted">Statut en ligne</th>
                <th className="pb-3 font-medium text-muted">Présence ce soir</th>
                {canManage && (
                  <th className="pb-3 font-medium text-muted">Gérer</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isOnline =
                  u.lastSeen &&
                  now.getTime() - u.lastSeen.getTime() <= ONLINE_THRESHOLD;
                const attendance = dailySession?.attendances.find(
                  (a) => a.userId === u.id
                );

                return (
                  <tr
                    key={u.id}
                    className="border-b border-border/50 last:border-0 hover:bg-surface-2/50 transition-colors duration-150"
                  >
                    <td className="py-3 font-medium text-text">
                      {u.name ?? u.email}
                    </td>
                    <td className="py-3">
                      <Badge color={u.role?.color ?? undefined}>
                        {u.role?.name ?? "Aucun rôle"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {isOnline ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          <span className="text-success font-medium text-xs">
                            En ligne
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted text-xs">
                          <span className="w-2 h-2 rounded-full bg-surface-2" />
                          {u.lastSeen
                            ? `Vu(e) le ${formatDate(u.lastSeen)}`
                            : "Jamais connecté"}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {attendance ? (
                        <Badge variant={ATTENDANCE_META[attendance.status].variant}>
                          {ATTENDANCE_META[attendance.status].label}
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-surface-2 text-muted border-border"
                        >
                          En attente
                        </Badge>
                      )}
                    </td>
                    {canManage && (
                      <td className="py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {attendance?.status !== "PRESENT" && (
                            <form action={setMemberAttendance.bind(null, u.id, "PRESENT")}>
                              <button
                                type="submit"
                                className="text-xs text-success hover:underline"
                              >
                                Présent
                              </button>
                            </form>
                          )}
                          {attendance?.status !== "LATE" && (
                            <form action={setMemberAttendance.bind(null, u.id, "LATE")}>
                              <button
                                type="submit"
                                className="text-xs text-warning hover:underline"
                              >
                                En retard
                              </button>
                            </form>
                          )}
                          {attendance?.status !== "ABSENT" && (
                            <form action={setMemberAttendance.bind(null, u.id, "ABSENT")}>
                              <button
                                type="submit"
                                className="text-xs text-danger hover:underline"
                              >
                                Absent
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── Historique de la semaine ─── */}
      {sortedPastSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-text mb-3">
            Historique de la semaine
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted pr-4">Membre</th>
                    {sortedPastSessions.map((s) => (
                      <th
                        key={s.id}
                        className="pb-3 font-medium text-muted text-center px-2 whitespace-nowrap"
                      >
                        {new Date(s.date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-2/30 transition-colors"
                    >
                      <td className="py-2.5 font-medium text-text pr-4 whitespace-nowrap">
                        {u.name ?? u.email}
                      </td>
                      {sortedPastSessions.map((s) => {
                        const att = s.attendances.find(
                          (a) => a.userId === u.id
                        );
                        return (
                          <td key={s.id} className="py-2.5 text-center px-2">
                            {att ? (
                              <Badge
                                variant={ATTENDANCE_META[att.status].variant}
                                className="text-[10px] px-1.5"
                              >
                                {att.status === "PRESENT"
                                  ? "✓"
                                  : att.status === "LATE"
                                  ? "⏱"
                                  : "✗"}
                              </Badge>
                            ) : (
                              <span className="text-muted/40 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
