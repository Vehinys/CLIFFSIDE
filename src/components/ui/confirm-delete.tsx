"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && state === null) {
      toast.success(successMessage);
    }
    wasPending.current = isPending;
  }, [isPending, state, successMessage]);

  // Fermer avec Escape + focus trap
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])"
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const dialogId = useId();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "text-xs text-danger hover:text-danger/70 disabled:opacity-50 disabled:cursor-not-allowed"
        }
        aria-haspopup="dialog"
      >
        {label}
      </button>

      {state?.error && (
        <p role="alert" className="text-xs text-danger mt-1 max-w-xs">
          {state.error}
        </p>
      )}

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/70"
            aria-hidden="true"
            onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
          />

          {/* Dialog */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogId}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 shadow-xl"
          >
            <p id={dialogId} className="text-sm text-text mb-5">
              {confirmMessage}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:text-text hover:bg-surface-2 transition-colors"
              >
                Annuler
              </button>
              <form action={formAction} onSubmit={() => setOpen(false)}>
                <button
                  ref={confirmRef}
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-white hover:bg-danger/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? "…" : "Confirmer"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
