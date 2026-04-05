import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateReport } from "../../../_actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReportPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canDo(session.user.permissions, "secretariat", "update")) redirect("/secretariat/reports");

  const report = await prisma.meetingReport.findUnique({ where: { id } });
  if (!report) notFound();

  const meetingDate = report.meetingDate.toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/secretariat/reports" className="text-muted hover:text-text text-sm">← Comptes-rendus</Link>
        <span className="text-border">/</span>
        <h1 className="text-xl font-bold text-text">Modifier le compte-rendu</h1>
      </div>

      <form action={updateReport.bind(null, id)} className="rounded-lg border border-border bg-surface p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title" required>Titre</Label>
            <Input id="title" name="title" defaultValue={report.title} required />
          </div>
          <div>
            <Label htmlFor="meetingDate" required>Date de réunion</Label>
            <Input id="meetingDate" name="meetingDate" type="date" defaultValue={meetingDate} required />
          </div>
        </div>
        <div>
          <Label htmlFor="content" required>Contenu</Label>
          <Textarea id="content" name="content" defaultValue={report.content} rows={8} required />
        </div>
        <div>
          <Label htmlFor="imageUrl">Image (URL)</Label>
          <Input id="imageUrl" name="imageUrl" type="url" defaultValue={report.imageUrl ?? ""} placeholder="https://…" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Enregistrer</Button>
          <Link href="/secretariat/reports"><Button type="button" variant="secondary">Annuler</Button></Link>
        </div>
      </form>
    </div>
  );
}
