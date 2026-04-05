import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateAnnouncement } from "../../../_actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "update")) redirect("/secretariat/announcements");

  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/secretariat/announcements" className="text-muted hover:text-text text-sm">← Annonces</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Modifier l&apos;annonce</h1>
      </div>

      <form action={updateAnnouncement.bind(null, id)} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="title" required>Titre</Label>
          <Input id="title" name="title" defaultValue={announcement.title} required />
        </div>
        <div>
          <Label htmlFor="content" required>Contenu</Label>
          <Textarea id="content" name="content" defaultValue={announcement.content} rows={6} required />
        </div>
        <div>
          <Label htmlFor="imageUrl">Image (URL)</Label>
          <Input id="imageUrl" name="imageUrl" type="url" defaultValue={announcement.imageUrl ?? ""} placeholder="https://…" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/secretariat/announcements"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
