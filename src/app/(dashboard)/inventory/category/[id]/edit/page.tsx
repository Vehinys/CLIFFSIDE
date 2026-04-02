import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateCategory } from "../../../_actions";

export default async function EditInventoryCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "inventory", "update")) redirect("/inventory");

  const category = await prisma.inventoryCategory.findUnique({
    where: { id },
  });

  if (!category) notFound();

  const updateCategoryWithId = updateCategory.bind(null, category.id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="text-muted hover:text-text text-sm">← Inventaire</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Modifier la catégorie</h1>
      </div>

      <form action={updateCategoryWithId} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="name" required>Nom de la catégorie</Label>
          <Input id="name" name="name" defaultValue={category.name} placeholder="Ex: Armes, Véhicules, Consommables…" required />
        </div>

        <div>
          <Label htmlFor="icon">Icône (emoji)</Label>
          <Input id="icon" name="icon" defaultValue={category.icon ?? ""} placeholder="🔫, 🚗, 🍔…" className="w-24 text-center" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/inventory"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
