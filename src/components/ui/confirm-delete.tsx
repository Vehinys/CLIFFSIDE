"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

type DeleteAction = (
  prevState: { error: string } | null,
  formData: FormData
) => Promise<{ error: string } | null>;

interface Props {
  action: DeleteAction;
  label?: string;
  confirmMessage?: string;
  successMessage?: string;
  className?: string;
}

export function ConfirmDelete({
  action,
  label = "Supprimer",
  confirmMessage = "Confirmer la suppression ?",
  successMessage = "Supprimé avec succès",
  className,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && state === null) {
      toast.success(successMessage);
    }
    wasPending.current = isPending;
  }, [isPending, state, successMessage]);

  return (
    <form action={formAction} className="inline">
      <button
        type="submit"
        disabled={isPending}
        onClick={(e) => {
          if (!window.confirm(confirmMessage)) e.preventDefault();
        }}
        className={
          className ??
          "text-xs text-danger hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        {isPending ? "…" : label}
      </button>
      {state?.error && (
        <p role="alert" className="text-xs text-danger mt-1 max-w-xs">
          {state.error}
        </p>
      )}
    </form>
  );
}
