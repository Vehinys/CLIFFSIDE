import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { deleteItem } from "../_actions";
import { QuantityControl } from "./QuantityControl";
import type { InventoryItem } from "@/generated/prisma/client";

interface Props {
  items: InventoryItem[];
  canEdit: boolean;
  canDelete: boolean;
}

function StockBar({ quantity, minStock }: { quantity: number; minStock: number }) {
  const ratio = Math.min(quantity / minStock, 1);
  const pct = Math.round(ratio * 100);
  const color = pct <= 30 ? "bg-danger" : pct <= 60 ? "bg-warning" : "bg-success";
  return (
    <div className="mt-1 flex items-center gap-1.5">
      <div
        className="w-14 h-1 rounded-full bg-surface-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={quantity}
        aria-valuemin={0}
        aria-valuemax={minStock}
        aria-label={`${quantity} sur ${minStock} minimum`}
      >
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs ${pct <= 30 ? "text-danger" : "text-muted"}`}>min {minStock}</span>
    </div>
  );
}

export function ItemTable({ items, canEdit, canDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 font-medium text-muted">Nom</th>
            <th className="pb-2 font-medium text-muted">Quantité</th>
            <th className="pb-2 font-medium text-muted">Unité</th>
            <th className="pb-2 font-medium text-muted">Activation</th>
            <th className="pb-2 font-medium text-muted">Expiration</th>
            <th className="pb-2 font-medium text-muted">Temps restant</th>
            <th className="pb-2 font-medium text-muted">Statut</th>
            {(canEdit || canDelete) && <th className="pb-2" />}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const now = new Date();
            const activatedAt = item.activatedAt ? new Date(item.activatedAt) : null;
            const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
            const isLowStock = item.minStock !== null && item.quantity <= item.minStock;

            let status: { label: string; variant: "default" | "success" | "warning" | "danger" } = {
              label: "Permanent",
              variant: "default",
            };
            let timeLeft = "—";
            let timeUrgent = false;

            if (expiresAt) {
              const diff = expiresAt.getTime() - now.getTime();
              if (diff <= 0) {
                status = { label: "Expiré", variant: "danger" };
                timeLeft = "Terminé";
                timeUrgent = true;
              } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                timeLeft = days > 0 ? `${days}j ${hours}h` : `${hours}h`;

                if (activatedAt && now < activatedAt) {
                  status = { label: "Programmé", variant: "default" };
                } else if (days < 1) {
                  status = { label: "< 1 jour", variant: "danger" };
                  timeUrgent = true;
                } else if (days < 3) {
                  status = { label: "< 3 jours", variant: "warning" };
                  timeUrgent = false;
                } else {
                  status = { label: "Actif", variant: "success" };
                }
              }
            }

            return (
              <tr
                key={item.id}
                className={`border-b border-border/50 last:border-0 transition-colors duration-150 ${
                  timeUrgent || status.variant === "danger"
                    ? "bg-danger/5 hover:bg-danger/10"
                    : isLowStock
                    ? "bg-warning/5 hover:bg-warning/10"
                    : "hover:bg-surface-2/50"
                }`}
              >
                <td className="py-2.5 font-medium text-text">{item.name}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    {canEdit ? (
                      <QuantityControl itemId={item.id} quantity={item.quantity} />
                    ) : (
                      <span className="font-mono text-text">{item.quantity}</span>
                    )}

                    {item.quantity < 5 && (
                      <Badge variant="danger" className="text-[10px] px-1.5 py-0">Critique ({"<"} 5)</Badge>
                    )}
                  </div>
                  {item.minStock !== null && (
                    <StockBar quantity={item.quantity} minStock={item.minStock} />
                  )}
                </td>
                <td className="py-2.5 text-muted">{item.unit ?? "—"}</td>
                <td className="py-2.5 text-muted text-xs">
                  {activatedAt ? activatedAt.toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="py-2.5 text-muted text-xs">
                  {expiresAt ? expiresAt.toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className={`py-2.5 text-xs font-mono ${timeUrgent ? "text-danger font-semibold" : status.variant === "danger" ? "text-danger" : "text-muted"}`}>
                  {timeLeft}
                </td>
                <td className="py-2.5">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                {(canEdit || canDelete) && (
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {canEdit && (
                        <Link href={`/inventory/${item.id}/edit`} className="text-xs text-muted hover:text-text transition-colors">
                          Modifier
                        </Link>
                      )}
                      {canDelete && (
                        <ConfirmDelete
                          action={deleteItem.bind(null, item.id)}
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
  );
}
