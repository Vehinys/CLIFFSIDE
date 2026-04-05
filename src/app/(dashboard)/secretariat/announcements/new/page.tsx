import { auth } from "@/lib/auth";
import { canDo } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement } from "../../_actions";

export default async function NewAnnouncementPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "create")) redirect("/secretariat/announcements");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/secretariat/announcements" className="text-muted hover:text-text text-sm">← Annonces</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Nouvelle annonce</h1>
      </div>

      <form action={createAnnouncement} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="title" required>Titre</Label>
          <Input id="title" name="title" placeholder="Titre de l'annonce" required />
        </div>
        <div>
          <Label htmlFor="content" required>Contenu</Label>
          <Textarea id="content" name="content" placeholder="Rédigez votre annonce…" rows={6} required />
        </div>
        <div>
          <Label htmlFor="imageUrl">Image (URL)</Label>
          <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://…" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Publier</Button>
          <Link href="/secretariat/announcements"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
