import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  respondAttendance,
  createObjective,
  toggleObjectiveDone,
  deleteObjective,
} from "./_actions";

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function tomorrowMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const perms = session.user.permissions ?? [];

  const now = new Date();
  const showAttendance = now.getHours() >= 6; // après 6h heure serveur

  const today = todayMidnight();
  const tomorrow = tomorrowMidnight();

  // Session du jour (présence + objectifs)
  const [dailySession, tomorrowSession, memberCount, itemCount, lowStockItems, lastTransactions, balance] =
    await Promise.all([
      prisma.dailySession.findUnique({
        where: { date: today },
        include: {
          attendances: { orderBy: { updatedAt: "asc" } },
          objectives: { orderBy: { createdAt: "asc" } },
        },
      }),
      canDo(perms, "objectives", "read")
        ? prisma.dailySession.findUnique({
            where: { date: tomorrow },
            include: { objectives: { orderBy: { createdAt: "asc" } } },
          })
        : Promise.resolve(null),
      canDo(perms, "members", "read") ? prisma.user.count() : null,
      canDo(perms, "inventory", "read") ? prisma.inventoryItem.count() : null,
      canDo(perms, "inventory", "read")
        ? prisma.inventoryItem
            .findMany({ include: { category: true }, take: 20 })
            .then((items) =>
              items.filter((i) => i.minStock !== null && i.quantity <= i.minStock).slice(0, 5)
            )
        : Promise.resolve([] as { id: string; name: string; quantity: number; minStock: number | null; category: { name: string } }[]),
      canDo(perms, "treasury", "read")
        ? prisma.treasuryTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
        : Promise.resolve([] as never[]),
      canDo(perms, "treasury", "read")
        ? prisma.treasuryTransaction.groupBy({ by: ["type"], _sum: { amount: true } })
        : Promise.resolve([] as never[]),
    ]);

  const myAttendance = dailySession?.attendances.find((a) => a.userId === session.user.id);
  const presentCount = dailySession?.attendances.filter((a) => a.status === "PRESENT").length ?? 0;
  const absentCount = dailySession?.attendances.filter((a) => a.status === "ABSENT").length ?? 0;

  const income = (balance as Array<{ type: string; _sum: { amount: number | null } }>)
    .find((b) => b.type === "INCOME")?._sum.amount ?? 0;
  const expense = (balance as Array<{ type: string; _sum: { amount: number | null } }>)
    .find((b) => b.type === "EXPENSE")?._sum.amount ?? 0;
  const currentBalance = income - expense;

  const canWriteObjectives = canDo(perms, "objectives", "create");
  const canUpdateObjectives = canDo(perms, "objectives", "update");
  const canDeleteObjectives = canDo(perms, "objectives", "delete");
  const canReadObjectives = canDo(perms, "objectives", "read");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Bienvenue, {session.user.name ?? session.user.email}
          {session.user.roleName && ` — ${session.user.roleName}`}
        </p>
      </div>

      {/* ── Présence 21h00 ─────────────────────────────── */}
      {showAttendance && (
        <Card className={myAttendance ? "border-border" : "border-warning/60 bg-warning/5"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Présence ce soir — 21h00</span>
              {myAttendance && (
                <Badge variant={myAttendance.status === "PRESENT" ? "success" : "danger"}>
                  {myAttendance.status === "PRESENT" ? "Présent" : "Absent"}
                </Badge>
              )}
              <span className="ml-auto text-xs font-normal text-muted">
                {presentCount} présent{presentCount !== 1 ? "s" : ""} · {absentCount} absent{absentCount !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>

          {!myAttendance && (
            <div className="mb-4 flex items-center gap-3">
              <p className="text-sm text-muted">Seras-tu là ce soir à 21h ?</p>
              <form action={respondAttendance.bind(null, "PRESENT")}>
                <Button type="submit" variant="secondary" className="border-success/40 text-success hover:bg-success/10">
                  ✓ Présent
                </Button>
              </form>
              <form action={respondAttendance.bind(null, "ABSENT")}>
                <Button type="submit" variant="secondary" className="border-danger/40 text-danger hover:bg-danger/10">
                  ✗ Absent
                </Button>
              </form>
            </div>
          )}

          {myAttendance && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted">
              <span>Changer ma réponse :</span>
              {myAttendance.status !== "PRESENT" && (
                <form action={respondAttendance.bind(null, "PRESENT")}>
                  <button type="submit" className="text-success hover:underline text-xs">Présent</button>
                </form>
              )}
              {myAttendance.status !== "ABSENT" && (
                <form action={respondAttendance.bind(null, "ABSENT")}>
                  <button type="submit" className="text-danger hover:underline text-xs">Absent</button>
                </form>
              )}
            </div>
          )}

          {dailySession && dailySession.attendances.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dailySession.attendances.map((a) => (
                <div key={a.id} className="flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 bg-surface-2 border border-border/50">
                  <span className={a.status === "PRESENT" ? "text-success" : "text-danger"}>
                    {a.status === "PRESENT" ? "✓" : "✗"}
                  </span>
                  <span className="text-text">{a.userName ?? a.userId}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Objectifs du jour / demain ──────────────────── */}
      {canReadObjectives && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Aujourd'hui */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Objectifs du jour
                <span className="ml-auto text-xs font-normal text-muted">
                  {dailySession?.objectives.filter((o) => o.done).length ?? 0}/{dailySession?.objectives.length ?? 0}
                </span>
              </CardTitle>
            </CardHeader>
            {dailySession?.objectives.length === 0 || !dailySession ? (
              <p className="text-sm text-muted italic mb-3">Aucun objectif pour aujourd&apos;hui.</p>
            ) : (
              <ul className="space-y-1.5 mb-3">
                {dailySession.objectives.map((obj) => (
                  <li key={obj.id} className="flex items-center gap-2 text-sm">
                    {canUpdateObjectives ? (
                      <form action={toggleObjectiveDone.bind(null, obj.id, !obj.done)}>
                        <button
                          type="submit"
                          className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${
                            obj.done ? "bg-success border-success" : "border-border hover:border-primary"
                          }`}
                          aria-label={obj.done ? "Marquer non fait" : "Marquer fait"}
                        />
                      </form>
                    ) : (
                      <span className={`w-4 h-4 rounded border flex-shrink-0 ${obj.done ? "bg-success border-success" : "border-border"}`} />
                    )}
                    <span className={obj.done ? "line-through text-muted" : "text-text"}>{obj.content}</span>
                    {canDeleteObjectives && (
                      <form action={deleteObjective.bind(null, obj.id)} className="ml-auto">
                        <button type="submit" className="text-muted hover:text-danger text-xs" aria-label="Supprimer">✕</button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {canWriteObjectives && (
              <form action={createObjective} className="flex gap-2 mt-1">
                <input type="hidden" name="day" value="today" />
                <Input name="content" placeholder="Nouvel objectif…" className="h-8 text-xs" required />
                <Button type="submit" className="h-8 text-xs px-3 flex-shrink-0">Ajouter</Button>
              </form>
            )}
          </Card>

          {/* Demain */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Objectifs de demain
                <span className="ml-auto text-xs font-normal text-muted">
                  {tomorrowSession?.objectives.filter((o) => o.done).length ?? 0}/{tomorrowSession?.objectives.length ?? 0}
                </span>
              </CardTitle>
            </CardHeader>
            {tomorrowSession?.objectives.length === 0 || !tomorrowSession ? (
              <p className="text-sm text-muted italic mb-3">Aucun objectif pour demain.</p>
            ) : (
              <ul className="space-y-1.5 mb-3">
                {tomorrowSession.objectives.map((obj) => (
                  <li key={obj.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-4 h-4 rounded border flex-shrink-0 ${obj.done ? "bg-success border-success" : "border-border"}`} />
                    <span className="text-text">{obj.content}</span>
                    {canDeleteObjectives && (
                      <form action={deleteObjective.bind(null, obj.id)} className="ml-auto">
                        <button type="submit" className="text-muted hover:text-danger text-xs" aria-label="Supprimer">✕</button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {canWriteObjectives && (
              <form action={createObjective} className="flex gap-2 mt-1">
                <input type="hidden" name="day" value="tomorrow" />
                <Input name="content" placeholder="Objectif pour demain…" className="h-8 text-xs" required />
                <Button type="submit" className="h-8 text-xs px-3 flex-shrink-0">Ajouter</Button>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* ── KPIs ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {memberCount !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted">Comptes inscrits</CardTitle>
            </CardHeader>
            <p className="text-3xl font-bold text-text">{memberCount}</p>
          </Card>
        )}
        {itemCount !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted">Articles inventaire</CardTitle>
            </CardHeader>
            <p className="text-3xl font-bold text-text">{itemCount}</p>
          </Card>
        )}
        {canDo(perms, "treasury", "read") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted">Solde trésorerie</CardTitle>
            </CardHeader>
            <p className={`text-3xl font-bold ${currentBalance >= 0 ? "text-success" : "text-danger"}`}>
              {formatMoney(currentBalance)}
            </p>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canDo(perms, "treasury", "read") && (lastTransactions as Array<{ id: string; type: string; amount: number; description: string; createdAt: Date }>).length > 0 && (
          <Card>
            <CardHeader><CardTitle>Dernières transactions</CardTitle></CardHeader>
            <ul className="space-y-2">
              {(lastTransactions as Array<{ id: string; type: string; amount: number; description: string; createdAt: Date }>).map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-text">{t.description}</span>
                    <span className="ml-2 text-xs text-muted">{formatDate(t.createdAt)}</span>
                  </div>
                  <span className={t.type === "INCOME" ? "text-success font-medium" : "text-danger font-medium"}>
                    {t.type === "INCOME" ? "+" : "-"}{formatMoney(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {canDo(perms, "inventory", "read") && (lowStockItems as Array<{ id: string; name: string; quantity: number; minStock: number | null; category: { name: string } }>).length > 0 && (
          <Card>
            <CardHeader><CardTitle>⚠ Stock bas</CardTitle></CardHeader>
            <ul className="space-y-2">
              {(lowStockItems as Array<{ id: string; name: string; quantity: number; minStock: number | null; category: { name: string } }>).map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-text">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">{item.category.name}</Badge>
                    <span className="text-danger font-medium">{item.quantity} / {item.minStock}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
