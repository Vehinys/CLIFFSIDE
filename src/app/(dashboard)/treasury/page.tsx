import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils";
import { deleteTransaction } from "./_actions";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

export default async function TreasuryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "treasury", "read")) redirect("/dashboard");

  const transactions = await prisma.treasuryTransaction.findMany({
    orderBy: { createdAt: "desc" },
  });

  const balance = transactions.reduce(
    (acc, t) => (t.type === "INCOME" ? acc + t.amount : acc - t.amount),
    0
  );
  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0);

  const canWrite = canDo(session.user.permissions, "treasury", "create");
  const canEdit = canDo(session.user.permissions, "treasury", "update");
  const canDelete = canDo(session.user.permissions, "treasury", "delete");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Trésorerie</h1>
          <p className="text-sm text-muted mt-1">{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/treasury/logs"><Button variant="secondary">Journal</Button></Link>
          {canWrite && (
            <Link href="/treasury/new"><Button>+ Nouvelle transaction</Button></Link>
          )}
        </div>
      </div>

      {/* Solde */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-xs uppercase tracking-wider text-muted">Solde</CardTitle></CardHeader>
          <p className={`text-3xl font-bold font-mono ${balance >= 0 ? "text-success" : "text-danger"}`}>
            {formatMoney(balance)}
          </p>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs uppercase tracking-wider text-muted">Total entrées</CardTitle></CardHeader>
          <p className="text-2xl font-bold font-mono text-success">+{formatMoney(totalIncome)}</p>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs uppercase tracking-wider text-muted">Total sorties</CardTitle></CardHeader>
          <p className="text-2xl font-bold font-mono text-danger">-{formatMoney(totalExpense)}</p>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        {transactions.length === 0 ? (
          <p className="text-center text-muted py-8">Aucune transaction enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Historique des transactions — {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted">Type</th>
                  <th className="pb-3 font-medium text-muted">Description</th>
                  <th className="pb-3 font-medium text-muted">Catégorie</th>
                  <th className="pb-3 font-medium text-muted">Montant</th>
                  <th className="pb-3 font-medium text-muted">Par</th>
                  <th className="pb-3 font-medium text-muted">Date</th>
                  {(canEdit || canDelete) && <th className="pb-3" />}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-surface-2/50 transition-colors duration-150">
                    <td className="py-3">
                      <Badge variant={t.type === "INCOME" ? "success" : "danger"}>
                        {t.type === "INCOME" ? "Entrée" : "Sortie"}
                      </Badge>
                    </td>
                    <td className="py-3 text-text">{t.description}</td>
                    <td className="py-3 text-muted">{t.category ?? "—"}</td>
                    <td className={`py-3 font-mono font-semibold ${t.type === "INCOME" ? "text-success" : "text-danger"}`}>
                      <span aria-label={`${t.type === "INCOME" ? "Crédit" : "Débit"} ${formatMoney(t.amount)}`}>
                        {t.type === "INCOME" ? "+" : "−"}{formatMoney(t.amount)}
                      </span>
                    </td>
                    <td className="py-3 text-muted text-xs">{t.createdByName ?? "—"}</td>
                    <td className="py-3 text-muted text-xs">{formatDate(t.createdAt)}</td>
                    {(canEdit || canDelete) && (
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {canEdit && (
                            <Link href={`/treasury/${t.id}/edit`} className="text-xs text-muted hover:text-text">Modifier</Link>
                          )}
                          {canDelete && (
                            <ConfirmDelete
                              action={deleteTransaction.bind(null, t.id)}
                              confirmMessage={`Supprimer "${t.description}" ?`}
                            />
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
