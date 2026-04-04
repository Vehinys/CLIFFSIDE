import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "./_actions";
import { ItemTable } from "./_components/ItemTable";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

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
                      <ConfirmDelete
                        action={deleteCategory.bind(null, group.id)}
                        confirmMessage={`Supprimer la catégorie "${group.name}" ?`}
                      />
                    )}
                  </div>
                )}
              </div>
              
              {group.items.length === 0 ? (
                <p className="text-xs text-muted italic py-2">Aucun article dans cette catégorie.</p>
              ) : (
                <ItemTable items={group.items} canEdit={canEdit} canDelete={canDelete} />
              )}
            </Card>
          ))}

          {uncategorized.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                Sans catégorie ({uncategorized.length})
              </h2>
              <ItemTable items={uncategorized} canEdit={canEdit} canDelete={canDelete} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
