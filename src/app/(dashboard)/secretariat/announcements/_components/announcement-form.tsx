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
    imageUrl?: string | null;
  } | undefined;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnnouncementForm({ action, initialData, onSuccess, onCancel }: Props) {
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
      toast.success(initialData ? "Annonce mise à jour" : "Annonce créée");
    }
  }, [state, initialData]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title" required>Titre</Label>
        <Input id="title" name="title" defaultValue={initialData?.title} placeholder="Titre de l'annonce" required />
      </div>
      <div>
        <Label htmlFor="content" required>Contenu</Label>
        <Textarea id="content" name="content" defaultValue={initialData?.content} placeholder="Texte de l'annonce…" rows={8} required />
      </div>
      <div>
        <Label htmlFor="imageUrl">Image (URL)</Label>
        <Input id="imageUrl" name="imageUrl" type="url" defaultValue={initialData?.imageUrl ?? ""} placeholder="https://…" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : initialData ? "Mettre à jour" : "Créer l'annonce"}
        </Button>
      </div>
    </form>
  );
}
