import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCategory } from "../../_actions";

export default async function NewInventoryCategoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "inventory", "create")) redirect("/inventory");

  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="text-muted hover:text-text text-sm">← Inventaire</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Nouvelle catégorie</h1>
      </div>

      <form action={createCategory} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="name" required>Nom de la catégorie</Label>
          <Input id="name" name="name" placeholder="Ex: Armes, Véhicules, Consommables…" required />
        </div>

        <div>
          <Label htmlFor="icon">Icône (emoji)</Label>
          <Input id="icon" name="icon" placeholder="🔫, 🚗, 🍔…" className="w-24 text-center" />
        </div>

        <div>
          <p className="text-sm font-medium text-text mb-2">Accès restreint aux rôles</p>
          <p className="text-xs text-muted mb-3">Laissez vide = visible par tous. Cochez les rôles autorisés.</p>
          <div className="space-y-2 rounded-md border border-border p-3">
            {roles.map((r) => (
              <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="roleIds"
                  value={r.id}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-text">{r.name}</span>
              </label>
            ))}
            {roles.length === 0 && (
              <p className="text-xs text-muted italic">Aucun rôle configuré.</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Créer la catégorie</Button>
          <Link href="/inventory"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
