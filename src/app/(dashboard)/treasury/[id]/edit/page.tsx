import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateTransaction } from "../../_actions";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "treasury", "update")) redirect("/treasury");

  const t = await prisma.treasuryTransaction.findUnique({ where: { id } });
  if (!t) notFound();

  const updateWithId = updateTransaction.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/treasury" className="text-muted hover:text-text text-sm">← Trésorerie</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Modifier transaction</h1>
      </div>

      <form action={updateWithId} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="type" required>Type</Label>
          <Select id="type" name="type" defaultValue={t.type} required>
            <option value="INCOME">💚 Entrée (recette)</option>
            <option value="EXPENSE">🔴 Sortie (dépense)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount" required>Montant ($)</Label>
          <Input id="amount" name="amount" type="number" min="1" defaultValue={t.amount} required />
        </div>
        <div>
          <Label htmlFor="description" required>Description</Label>
          <Input id="description" name="description" defaultValue={t.description} required />
        </div>
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Input id="category" name="category" defaultValue={t.category ?? ""} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/treasury"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
