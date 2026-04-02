import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateItem } from "../../_actions";

export default async function EditInventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "inventory", "update")) redirect("/inventory");

  const [item, categories] = await Promise.all([
    prisma.inventoryItem.findUnique({ where: { id } }),
    prisma.inventoryCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!item) notFound();

  const updateWithId = updateItem.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="text-muted hover:text-text text-sm">← Inventaire</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Modifier — {item.name}</h1>
      </div>

      <form action={updateWithId} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="name" required>Nom de l&apos;article</Label>
          <Input id="name" name="name" defaultValue={item.name} required />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={item.description ?? ""} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quantity" required>Quantité</Label>
            <Input id="quantity" name="quantity" type="number" min="0" defaultValue={item.quantity} required />
          </div>
          <div>
            <Label htmlFor="unit">Unité</Label>
            <Input id="unit" name="unit" defaultValue={item.unit ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="activatedAt">Date d&apos;activation</Label>
            <Input id="activatedAt" name="activatedAt" type="date" defaultValue={item.activatedAt ? new Date(item.activatedAt).toISOString().split('T')[0] : ""} />
          </div>
          <div>
            <Label htmlFor="expiresAt">Date d&apos;expiration</Label>
            <Input id="expiresAt" name="expiresAt" type="date" defaultValue={item.expiresAt ? new Date(item.expiresAt).toISOString().split('T')[0] : ""} />
          </div>
        </div>

        <div>
          <Label htmlFor="categoryId" required>Catégorie</Label>
          <Select id="categoryId" name="categoryId" defaultValue={item.categoryId} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </Select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/inventory"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
