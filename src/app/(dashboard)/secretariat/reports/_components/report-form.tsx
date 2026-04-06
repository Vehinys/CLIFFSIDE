"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  action: (formData: FormData) => Promise<{ error: string } | null>;
  initialData?: {
    title: string;
    content: string;
    meetingDate: string; // ISO string YYYY-MM-DD
    imageUrl?: string | null;
  } | undefined;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReportForm({ action, initialData, onSuccess, onCancel }: Props) {
  const [state, formAction, isPending] = useActionState(async (_prevState: unknown, formData: FormData) => {
    const result = await action(formData);
    if (result?.error) return result;
    onSuccess?.();
    return { success: true };
  }, null);

  useEffect(() => {
    if (state && "error" in state) {
      toast.error(state.error as string);
    }
    if (state && "success" in state) {
      toast.success(initialData ? "Mis à jour" : "Créé avec succès");
    }
  }, [state, initialData]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" required>Titre</Label>
          <Input id="title" name="title" defaultValue={initialData?.title} placeholder="Ex: Réunion du 02/04" required />
        </div>
        <div>
          <Label htmlFor="meetingDate" required>Date de réunion</Label>
          <Input id="meetingDate" name="meetingDate" type="date" defaultValue={initialData?.meetingDate ?? today} required />
        </div>
      </div>
      <div>
        <Label htmlFor="content" required>Contenu</Label>
        <Textarea id="content" name="content" defaultValue={initialData?.content} placeholder="Résumé des décisions, présents, points abordés…" rows={10} required />
      </div>
      <div>
        <Label htmlFor="imageUrl">Image (URL)</Label>
        <Input id="imageUrl" name="imageUrl" type="url" defaultValue={initialData?.imageUrl ?? ""} placeholder="https://…" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : initialData ? "Mettre à jour" : "Créer le rapport"}
        </Button>
      </div>
    </form>
  );
}
