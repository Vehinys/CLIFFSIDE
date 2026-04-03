import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateNote } from "../../../_actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNotePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "update")) redirect("/secretariat/notes");

  const note = await prisma.sharedNote.findUnique({ where: { id } });
  if (!note) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/secretariat/notes" className="text-muted hover:text-text text-sm">← Notes</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Modifier la note</h1>
      </div>

      <form action={updateNote.bind(null, id)} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div>
          <Label htmlFor="title" required>Titre</Label>
          <Input id="title" name="title" defaultValue={note.title} required />
        </div>
        <div>
          <Label htmlFor="content" required>Contenu</Label>
          <Textarea id="content" name="content" defaultValue={note.content} rows={8} required />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/secretariat/notes"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
