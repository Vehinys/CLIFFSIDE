"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { adjustQuantity } from "../_actions";

interface Props {
  itemId: string;
  quantity: number;
}

export function QuantityControl({ itemId, quantity }: Props) {
  const [stateSub, subAction, pendingSub] = useActionState(
    adjustQuantity.bind(null, itemId, -1),
    null
  );
  const [stateAdd, addAction, pendingAdd] = useActionState(
    adjustQuantity.bind(null, itemId, 1),
    null
  );

  const error = stateSub?.error ?? stateAdd?.error;

  const wasPendingSub = useRef(false);
  const wasPendingAdd = useRef(false);

  useEffect(() => {
    if (wasPendingSub.current && !pendingSub && stateSub === null) {
      toast.success("Quantité mise à jour");
    }
    wasPendingSub.current = pendingSub;
  }, [pendingSub, stateSub]);

  useEffect(() => {
    if (wasPendingAdd.current && !pendingAdd && stateAdd === null) {
      toast.success("Quantité mise à jour");
    }
    wasPendingAdd.current = pendingAdd;
  }, [pendingAdd, stateAdd]);

  return (
    <div className="flex items-center gap-2">
      <form action={subAction}>
        <button
          type="submit"
          disabled={pendingSub || pendingAdd}
          className="w-8 h-8 rounded text-sm font-bold text-white bg-danger hover:bg-primary-hover leading-none disabled:opacity-40 transition-colors"
          aria-label="Retirer 1"
        >
          {pendingSub ? "…" : "−"}
        </button>
      </form>
      <span className="font-mono text-text w-24 text-center tabular-nums text-base font-semibold">{quantity}</span>
      <form action={addAction}>
        <button
          type="submit"
          disabled={pendingSub || pendingAdd}
          className="w-8 h-8 rounded text-sm font-bold text-white bg-danger hover:bg-primary-hover leading-none disabled:opacity-40 transition-colors"
          aria-label="Ajouter 1"
        >
          {pendingAdd ? "…" : "+"}
        </button>
      </form>
      {error && (
        <span role="alert" className="text-xs text-danger ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
