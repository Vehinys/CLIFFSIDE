import { auth } from "@/lib/auth";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "../../_actions";

export default async function NewReportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "create")) redirect("/secretariat/reports");

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/secretariat/reports" className="text-muted hover:text-text text-sm">← Comptes-rendus</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Nouveau compte-rendu</h1>
      </div>

      <form action={createReport} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title" required>Titre</Label>
            <Input id="title" name="title" placeholder="Ex: Réunion du 02/04" required />
          </div>
          <div>
            <Label htmlFor="meetingDate" required>Date de réunion</Label>
            <Input id="meetingDate" name="meetingDate" type="date" defaultValue={today} required />
          </div>
        </div>
        <div>
          <Label htmlFor="content" required>Contenu</Label>
          <Textarea id="content" name="content" placeholder="Résumé des décisions, présents, points abordés…" rows={8} required />
        </div>
        <div>
          <Label htmlFor="imageUrl">Image (URL)</Label>
          <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://…" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/secretariat/reports"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
