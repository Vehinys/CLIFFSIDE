import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createItem, createCategory } from "../_actions";

export default async function NewInventoryItemPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "inventory", "create")) redirect("/inventory");

  const categories = await prisma.inventoryCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="text-muted hover:text-text text-sm">← Inventaire</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Nouvel article</h1>
      </div>

      {/* Créer une catégorie si aucune */}
      {categories.length === 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <p className="text-sm text-warning mb-3">Aucune catégorie. Créez-en une d&apos;abord :</p>
          <form action={createCategory} className="flex gap-2">
            <Input name="name" placeholder="Ex: Armes, Véhicules…" className="flex-1" required />
            <Input name="icon" placeholder="🔫" className="w-16 text-center" />
            <Button type="submit" size="sm">Créer</Button>
          </form>
        </div>
      )}

      <form action={createItem} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="name" required>Nom de l&apos;article</Label>
          <Input id="name" name="name" placeholder="Ex: AK-47, Sultan RS…" required />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Description optionnelle…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quantity" required>Quantité</Label>
            <Input id="quantity" name="quantity" type="number" min="0" defaultValue="0" required />
          </div>
          <div>
            <Label htmlFor="unit">Unité</Label>
            <Input id="unit" name="unit" placeholder="unité, kg, caisse…" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="activatedAt">Date et heure d&apos;activation</Label>
            <Input id="activatedAt" name="activatedAt" type="datetime-local" />
          </div>
          <div>
            <Label htmlFor="expiresAt">Date et heure d&apos;expiration</Label>
            <Input id="expiresAt" name="expiresAt" type="datetime-local" />
          </div>
        </div>

        <div>
          <Label htmlFor="categoryId" required>Catégorie</Label>
          <Select id="categoryId" name="categoryId" required disabled={categories.length === 0}>
            <option value="">Sélectionner…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </Select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={categories.length === 0}>
            {categories.length === 0 ? "Créer une catégorie d'abord" : "Créer l'article"}
          </Button>
          <Link href="/inventory"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
