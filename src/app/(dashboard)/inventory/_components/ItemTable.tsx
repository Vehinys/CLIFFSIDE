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

export function ItemTable({ items, canEdit, canDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 font-medium text-muted">Nom</th>
            <th className="pb-2 font-medium text-muted">Qté</th>
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

            let status: { label: string; variant: "default" | "success" | "warning" | "danger" } = {
              label: "Permanent",
              variant: "default",
            };
            let timeLeft = "—";

            if (expiresAt) {
              const diff = expiresAt.getTime() - now.getTime();
              if (diff <= 0) {
                status = { label: "Expiré", variant: "danger" };
                timeLeft = "Terminé";
              } else {
                status =
                  activatedAt && now < activatedAt
                    ? { label: "Programmé", variant: "warning" }
                    : { label: "Actif", variant: "success" };
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                timeLeft = days > 0 ? `${days}j ${hours}h` : `${hours}h`;
              }
            }

            return (
              <tr
                key={item.id}
                className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors"
              >
                <td className="py-2.5 font-medium text-text">{item.name}</td>
                <td className="py-2.5">
                  {canEdit ? (
                    <QuantityControl itemId={item.id} quantity={item.quantity} />
                  ) : (
                    <span className="font-mono text-text">{item.quantity}</span>
                  )}
                </td>
                <td className="py-2.5 text-muted">{item.unit ?? "—"}</td>
                <td className="py-2.5 text-muted text-xs">
                  {activatedAt ? activatedAt.toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="py-2.5 text-muted text-xs">
                  {expiresAt ? expiresAt.toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className={`py-2.5 text-xs font-mono ${status.variant === "danger" ? "text-danger" : "text-muted"}`}>
                  {timeLeft}
                </td>
                <td className="py-2.5">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                {(canEdit || canDelete) && (
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <Link href={`/inventory/${item.id}/edit`} className="text-xs text-muted hover:text-text">
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
