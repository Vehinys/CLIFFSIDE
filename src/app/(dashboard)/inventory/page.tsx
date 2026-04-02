import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteItem, deleteCategory, adjustQuantity } from "./_actions";

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "inventory", "read")) redirect("/dashboard");

  const items = await prisma.inventoryItem.findMany({
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  const categories = await prisma.inventoryCategory.findMany({ orderBy: { name: "asc" } });
  const canWrite = canDo(session.user.permissions, "inventory", "create");
  const canDelete = canDo(session.user.permissions, "inventory", "delete");
  const canEdit = canDo(session.user.permissions, "inventory", "update");

  // Grouper par catégorie
  const grouped = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.categoryId === cat.id),
  }));
  const uncategorized = items.filter((i) => !categories.find((c) => c.id === i.categoryId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Inventaire</h1>
          <p className="text-sm text-muted mt-1">{items.length} article{items.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/inventory/logs">
            <Button variant="secondary">Journal</Button>
          </Link>
          {canWrite && (
            <>
              <Link href="/inventory/category/new">
                <Button variant="secondary">+ Nouvelle catégorie</Button>
              </Link>
              <Link href="/inventory/new">
                <Button>+ Nouvel article</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {categories.length === 0 && items.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted">Aucun article ou catégorie dans l&apos;inventaire.</p>
          {canWrite && (
            <Link href="/inventory/category/new" className="mt-3 inline-block text-sm text-primary hover:underline">
              Créer la première catégorie →
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <Card key={group.id}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  {group.icon && <span className="mr-1">{group.icon}</span>}
                  {group.name} ({group.items.length})
                </h2>
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <Link href={`/inventory/category/${group.id}/edit`} className="text-xs text-muted hover:text-text">
                        Modifier catégorie
                      </Link>
                    )}
                    {canDelete && (
                      <form action={deleteCategory.bind(null, group.id)}>
                        <button type="submit" className="text-xs text-danger hover:text-red-400" title="Attention: supprime la catégorie si vide">
                          Supprimer
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
              
              {group.items.length === 0 ? (
                <p className="text-xs text-muted italic py-2">Aucun article dans cette catégorie.</p>
              ) : (
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
                      {group.items.map((item) => {
                        const now = new Date();
                        const activatedAt = item.activatedAt ? new Date(item.activatedAt) : null;
                        const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
                        
                        let status: { label: string; variant: "default" | "success" | "warning" | "danger" } = { label: "Permanent", variant: "default" };
                        let timeLeft = "—";

                        if (expiresAt) {
                          const diff = expiresAt.getTime() - now.getTime();
                          if (diff <= 0) {
                            status = { label: "Expiré", variant: "danger" };
                            timeLeft = "Terminé";
                          } else {
                            if (activatedAt && now < activatedAt) {
                              status = { label: "Programmé", variant: "warning" };
                            } else {
                              status = { label: "Actif", variant: "success" };
                            }
                            
                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            timeLeft = days > 0 ? `${days}j ${hours}h` : `${hours}h`;
                          }
                        }

                        return (
                          <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                            <td className="py-2.5 font-medium text-text">{item.name}</td>
                            <td className="py-2.5">
                              {canEdit ? (
                                <div className="flex items-center gap-1">
                                  <form action={adjustQuantity.bind(null, item.id, -1)}>
                                    <button type="submit" className="w-6 h-6 rounded text-xs text-muted hover:text-text hover:bg-surface border border-border/50 leading-none" aria-label="Retirer 1">−</button>
                                  </form>
                                  <span className="font-mono text-text w-8 text-center tabular-nums">{item.quantity}</span>
                                  <form action={adjustQuantity.bind(null, item.id, 1)}>
                                    <button type="submit" className="w-6 h-6 rounded text-xs text-muted hover:text-text hover:bg-surface border border-border/50 leading-none" aria-label="Ajouter 1">+</button>
                                  </form>
                                </div>
                              ) : (
                                <span className="font-mono text-text">{item.quantity}</span>
                              )}
                            </td>
                            <td className="py-2.5 text-muted">{item.unit ?? "—"}</td>
                            <td className="py-2.5 text-muted text-xs">
                              {activatedAt ? activatedAt.toLocaleDateString('fr-FR') : "—"}
                            </td>
                            <td className="py-2.5 text-muted text-xs">
                              {expiresAt ? expiresAt.toLocaleDateString('fr-FR') : "—"}
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
                                    <form action={deleteItem.bind(null, item.id)}>
                                      <button type="submit" className="text-xs text-danger hover:text-red-400">
                                        Supprimer
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
              )}
            </Card>
          ))}

          {uncategorized.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                Sans catégorie ({uncategorized.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {/* ... same table as above ... */}
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
                      {uncategorized.map((item) => {
                        const now = new Date();
                        const activatedAt = item.activatedAt ? new Date(item.activatedAt) : null;
                        const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
                        
                        let status: { label: string; variant: "default" | "success" | "warning" | "danger" } = { label: "Permanent", variant: "default" };
                        let timeLeft = "—";

                        if (expiresAt) {
                          const diff = expiresAt.getTime() - now.getTime();
                          if (diff <= 0) {
                            status = { label: "Expiré", variant: "danger" };
                            timeLeft = "Terminé";
                          } else {
                            if (activatedAt && now < activatedAt) {
                              status = { label: "Programmé", variant: "warning" };
                            } else {
                              status = { label: "Actif", variant: "success" };
                            }
                            
                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            timeLeft = days > 0 ? `${days}j ${hours}h` : `${hours}h`;
                          }
                        }

                        return (
                          <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                            <td className="py-2.5 font-medium text-text">{item.name}</td>
                            <td className="py-2.5">
                              {canEdit ? (
                                <div className="flex items-center gap-1">
                                  <form action={adjustQuantity.bind(null, item.id, -1)}>
                                    <button type="submit" className="w-6 h-6 rounded text-xs text-muted hover:text-text hover:bg-surface border border-border/50 leading-none" aria-label="Retirer 1">−</button>
                                  </form>
                                  <span className="font-mono text-text w-8 text-center tabular-nums">{item.quantity}</span>
                                  <form action={adjustQuantity.bind(null, item.id, 1)}>
                                    <button type="submit" className="w-6 h-6 rounded text-xs text-muted hover:text-text hover:bg-surface border border-border/50 leading-none" aria-label="Ajouter 1">+</button>
                                  </form>
                                </div>
                              ) : (
                                <span className="font-mono text-text">{item.quantity}</span>
                              )}
                            </td>
                            <td className="py-2.5 text-muted">{item.unit ?? "—"}</td>
                            <td className="py-2.5 text-muted text-xs">
                              {activatedAt ? activatedAt.toLocaleDateString('fr-FR') : "—"}
                            </td>
                            <td className="py-2.5 text-muted text-xs">
                              {expiresAt ? expiresAt.toLocaleDateString('fr-FR') : "—"}
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
                                  <form action={deleteItem.bind(null, item.id)}>
                                    <button type="submit" className="text-xs text-danger hover:text-red-400">
                                      Supprimer
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
          )}
        </div>
      )}
    </div>
  );
}
