import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updatePerishable } from "../../_actions";

export default async function EditPerishablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "perishables", "update")) redirect("/perishables");

  const item = await prisma.perishableItem.findUnique({ where: { id } });
  if (!item) notFound();

  const updateWithId = updatePerishable.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/perishables" className="text-muted hover:text-text text-sm">
          ← Périssables
        </Link>
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
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              defaultValue={item.quantity}
              required
            />
          </div>
          <div>
            <Label htmlFor="unit">Unité</Label>
            <Input id="unit" name="unit" defaultValue={item.unit ?? ""} />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Input id="category" name="category" defaultValue={item.category ?? ""} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="enteredAt" required>Date d&apos;entrée en stock</Label>
            <Input
              id="enteredAt"
              name="enteredAt"
              type="datetime-local"
              defaultValue={new Date(item.enteredAt).toISOString().slice(0, 16)}
              required
            />
          </div>
          <div>
            <Label htmlFor="expiresAt" required>Date d&apos;expiration</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              defaultValue={new Date(item.expiresAt).toISOString().slice(0, 16)}
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/perishables">
            <Button type="button" variant="secondary">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
