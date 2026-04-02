import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const perms = session.user.permissions ?? [];

  const [memberCount, itemCount, lowStockItems, lastTransactions, balance] = await Promise.all([
    canDo(perms, "members", "read") ? prisma.user.count() : null,
    canDo(perms, "inventory", "read") ? prisma.inventoryItem.count() : null,
    canDo(perms, "inventory", "read")
      ? prisma.inventoryItem.findMany({ include: { category: true }, take: 20 })
          .then((items) => items.filter((i) => i.minStock !== null && i.quantity <= i.minStock).slice(0, 5))
      : Promise.resolve([] as { id: string; name: string; quantity: number; minStock: number | null; category: { name: string } }[]),
    canDo(perms, "treasury", "read")
      ? prisma.treasuryTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
      : Promise.resolve([] as never[]),
    canDo(perms, "treasury", "read")
      ? prisma.treasuryTransaction.groupBy({
          by: ["type"],
          _sum: { amount: true },
        })
      : Promise.resolve([] as never[]),
  ]);

  const income = (balance as Array<{ type: string; _sum: { amount: number | null } }>)
    .find((b) => b.type === "INCOME")?._sum.amount ?? 0;
  const expense = (balance as Array<{ type: string; _sum: { amount: number | null } }>)
    .find((b) => b.type === "EXPENSE")?._sum.amount ?? 0;
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

      {/* Stats */}
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
        {/* Dernières transactions */}
        {canDo(perms, "treasury", "read") && (lastTransactions as Array<{ id: string; type: string; amount: number; description: string; createdAt: Date }>).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dernières transactions</CardTitle>
            </CardHeader>
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

        {/* Alertes stock bas */}
        {canDo(perms, "inventory", "read") && (lowStockItems as Array<{ id: string; name: string; quantity: number; minStock: number | null; category: { name: string } }>).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>⚠ Stock bas</CardTitle>
            </CardHeader>
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
