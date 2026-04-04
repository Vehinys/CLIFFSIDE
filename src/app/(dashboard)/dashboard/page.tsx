import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { AttendanceCard } from "./_components/AttendanceCard";
import { ObjectivesSection } from "./_components/ObjectivesSection";
import { KpiGrid } from "./_components/KpiGrid";
import { RecentActivity } from "./_components/RecentActivity";

type Transaction = Prisma.TreasuryTransactionGetPayload<object>;
type LowStockItem = Prisma.InventoryItemGetPayload<{ include: { category: true } }>;
type BalanceSummary = Array<{ type: string; _sum: { amount: number | null } }>;

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
  const showAttendance = now.getHours() >= 6;
  const today = todayMidnight();
  const tomorrow = tomorrowMidnight();

  const canReadObjectives = canDo(perms, "objectives", "read");
  const canReadMembers = canDo(perms, "members", "read");
  const canReadInventory = canDo(perms, "inventory", "read");
  const canReadTreasury = canDo(perms, "treasury", "read");

  // ── Données parallèles ─────────────────────────────────────────────────────
  const [dailySession, tomorrowSession, memberCount, itemCount, lowStockItems, lastTransactions, balanceSummary] =
    await Promise.all([
      prisma.dailySession.findUnique({
        where: { date: today },
        include: {
          attendances: { orderBy: { updatedAt: "asc" } },
          objectives: { orderBy: { createdAt: "asc" } },
        },
      }),
      canReadObjectives
        ? prisma.dailySession.findUnique({
            where: { date: tomorrow },
            include: { objectives: { orderBy: { createdAt: "asc" } } },
          })
        : Promise.resolve(null),
      canReadMembers ? prisma.user.count() : Promise.resolve(null),
      canReadInventory ? prisma.inventoryItem.count() : Promise.resolve(null),
      canReadInventory
        ? prisma.inventoryItem.findMany({
            where: { minStock: { not: null } },
            include: { category: true },
            orderBy: { quantity: "asc" },
            take: 5,
          }).then((items) => items.filter((i) => i.quantity <= (i.minStock ?? Infinity)) as LowStockItem[])
        : Promise.resolve([] as LowStockItem[]),
      canReadTreasury
        ? prisma.treasuryTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 5 }) as Promise<Transaction[]>
        : Promise.resolve([] as Transaction[]),
      canReadTreasury
        ? prisma.treasuryTransaction.groupBy({ by: ["type"], _sum: { amount: true } }) as Promise<BalanceSummary>
        : Promise.resolve([] as BalanceSummary),
    ]);

  // ── Calculs dérivés ────────────────────────────────────────────────────────
  const income = balanceSummary.find((b) => b.type === "INCOME")?._sum.amount ?? 0;
  const expense = balanceSummary.find((b) => b.type === "EXPENSE")?._sum.amount ?? 0;
  const currentBalance = income - expense;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Bienvenue, {session.user.name ?? session.user.email}
          {session.user.roleName && ` — ${session.user.roleName}`}
        </p>
      </div>

      {showAttendance && dailySession && (
        <AttendanceCard
          currentUserId={session.user.id}
          attendances={dailySession.attendances}
        />
      )}

      {canReadObjectives && (
        <ObjectivesSection
          todayObjectives={dailySession?.objectives ?? []}
          tomorrowObjectives={tomorrowSession?.objectives ?? []}
          canWrite={canDo(perms, "objectives", "create")}
          canUpdate={canDo(perms, "objectives", "update")}
          canDelete={canDo(perms, "objectives", "delete")}
        />
      )}

      <KpiGrid
        memberCount={memberCount ?? null}
        itemCount={itemCount ?? null}
        currentBalance={canReadTreasury ? currentBalance : null}
      />

      <RecentActivity transactions={lastTransactions} lowStockItems={lowStockItems} />
    </div>
  );
}
