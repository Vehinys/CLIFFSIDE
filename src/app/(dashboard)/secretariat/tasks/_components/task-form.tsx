"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Member {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  action: (formData: FormData) => Promise<{ error: string } | null>;
  members: Member[];
  initialData?: {
    title: string;
    description?: string | null;
    assignedToId?: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE";
  } | undefined;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ action, members, initialData, onSuccess, onCancel }: Props) {
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
      toast.success(initialData ? "Tâche mise à jour" : "Tâche créée");
    }
  }, [state, initialData]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title" required>Titre</Label>
        <Input id="title" name="title" defaultValue={initialData?.title} placeholder="Titre de la tâche" required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={initialData?.description ?? ""} placeholder="Détails optionnels…" rows={5} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.length > 0 && (
          <div>
            <Label htmlFor="assignedToId">Assigner à</Label>
            <select
              id="assignedToId"
              name="assignedToId"
              defaultValue={initialData?.assignedToId ?? ""}
              className="w-full h-10 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-shadow"
            >
              <option value="">— Non assigné —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
              ))}
            </select>
          </div>
        )}
        {initialData && (
          <div>
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              name="status"
              defaultValue={initialData.status}
              className="w-full h-10 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-shadow"
            >
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Terminé</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : initialData ? "Mettre à jour" : "Créer la tâche"}
        </Button>
      </div>
    </form>
  );
}
