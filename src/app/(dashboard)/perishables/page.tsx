import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { deletePerishable } from "./_actions";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

type AlertStatus = "expired" | "expiring_soon" | "ok";

function getAlertStatus(expiresAt: Date): AlertStatus {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  if (expiresAt <= now) return "expired";
  if (expiresAt <= soon) return "expiring_soon";
  return "ok";
}

const STATUS_META: Record<AlertStatus, { label: string; variant: "danger" | "warning" | "success" }> = {
  expired:       { label: "Expiré",  variant: "danger"  },
  expiring_soon: { label: "Bientôt", variant: "warning" },
  ok:            { label: "OK",      variant: "success" },
};

export default async function PerishablesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "perishables", "read")) redirect("/dashboard");

  const items = await prisma.perishableItem.findMany({
    orderBy: { expiresAt: "asc" },
  });

  const canWrite  = canDo(session.user.permissions, "perishables", "create");
  const canEdit   = canDo(session.user.permissions, "perishables", "update");
  const canDelete = canDo(session.user.permissions, "perishables", "delete");

  const withStatus = items.map((i) => ({ ...i, status: getAlertStatus(i.expiresAt) }));
  const expired      = withStatus.filter((i) => i.status === "expired").length;
  const expiringSoon = withStatus.filter((i) => i.status === "expiring_soon").length;
  const ok           = withStatus.filter((i) => i.status === "ok").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Périssables</h1>
          <p className="text-sm text-muted mt-1">
            {items.length} article{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/perishables/logs">
            <Button variant="secondary">Journal</Button>
          </Link>
          {canWrite && (
            <Link href="/perishables/new">
              <Button>+ Nouvel article</Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" role="list" aria-label="Résumé des stocks périssables">
        <Card role="listitem" aria-label={`Total : ${items.length} article${items.length !== 1 ? "s" : ""}`}>
          <CardHeader className="mb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-muted">Total</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-text" aria-hidden="true">{items.length}</p>
        </Card>
        <Card className={`border-l-2 ${expired > 0 ? "border-l-danger" : "border-l-border"}`} role="listitem" aria-label={`Expirés : ${expired} article${expired !== 1 ? "s" : ""}`}>
          <CardHeader className="mb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-muted">Expirés</CardTitle>
          </CardHeader>
          <p className={`text-3xl font-bold ${expired > 0 ? "text-danger" : "text-muted"}`} aria-hidden="true">
            {expired}
          </p>
        </Card>
        <Card className={`border-l-2 ${expiringSoon > 0 ? "border-l-warning" : "border-l-border"}`} role="listitem" aria-label={`Expirant bientôt (moins de 3 jours) : ${expiringSoon} article${expiringSoon !== 1 ? "s" : ""}`}>
          <CardHeader className="mb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-muted">Bientôt (&lt; 3j)</CardTitle>
          </CardHeader>
          <p className={`text-3xl font-bold ${expiringSoon > 0 ? "text-warning" : "text-muted"}`} aria-hidden="true">
            {expiringSoon}
          </p>
        </Card>
        <Card className={`border-l-2 ${ok > 0 ? "border-l-success" : "border-l-border"}`} role="listitem" aria-label={`Sains : ${ok} article${ok !== 1 ? "s" : ""}`}>
          <CardHeader className="mb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-muted">Sains</CardTitle>
          </CardHeader>
          <p className={`text-3xl font-bold ${ok > 0 ? "text-success" : "text-muted"}`} aria-hidden="true">{ok}</p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        {items.length === 0 ? (
          <p className="text-center text-muted py-8">Aucun article périssable enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Articles périssables — {items.length} article{items.length !== 1 ? "s" : ""}</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted">Statut</th>
                  <th className="pb-3 font-medium text-muted">Article</th>
                  <th className="pb-3 font-medium text-muted">Catégorie</th>
                  <th className="pb-3 font-medium text-muted">Quantité</th>
                  <th className="pb-3 font-medium text-muted">Entrée le</th>
                  <th className="pb-3 font-medium text-muted">Expire le</th>
                  {(canEdit || canDelete) && <th className="pb-3" />}
                </tr>
              </thead>
              <tbody>
                {withStatus.map((item) => {
                  const meta = STATUS_META[item.status];
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-border/50 last:border-0 transition-colors duration-150 ${
                        item.status === "expired"
                          ? "bg-danger/5 hover:bg-danger/10"
                          : item.status === "expiring_soon"
                          ? "bg-warning/5 hover:bg-warning/10"
                          : "hover:bg-surface-2/50"
                      }`}
                    >
                      <td className="py-3">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-text">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted mt-0.5">{item.description}</p>
                        )}
                      </td>
                      <td className="py-3 text-muted">{item.category ?? "—"}</td>
                      <td className="py-3 font-mono text-text">
                        {item.quantity}
                        {item.unit ? ` ${item.unit}` : ""}
                      </td>
                      <td className="py-3 text-xs text-muted">{formatDate(item.enteredAt)}</td>
                      <td
                        className={`py-3 text-xs font-medium ${
                          item.status === "expired"
                            ? "text-danger"
                            : item.status === "expiring_soon"
                            ? "text-warning"
                            : "text-muted"
                        }`}
                      >
                        {formatDate(item.expiresAt)}
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {canEdit && (
                              <Link
                                href={`/perishables/${item.id}/edit`}
                                className="text-xs text-muted hover:text-text"
                              >
                                Modifier
                              </Link>
                            )}
                            {canDelete && (
                              <ConfirmDelete
                                action={deletePerishable.bind(null, item.id)}
                                confirmMessage={`Supprimer "${item.name}" ?`}
                              />
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
        )}
      </Card>
    </div>
  );
}
