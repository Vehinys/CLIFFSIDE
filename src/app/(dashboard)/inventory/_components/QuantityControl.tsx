"use client";

import { useActionState } from "react";
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

  return (
    <div className="flex items-center gap-1">
      <form action={subAction}>
        <button
          type="submit"
          disabled={pendingSub || pendingAdd}
          className="w-6 h-6 rounded text-xs text-muted hover:text-text hover:bg-surface border border-border/50 leading-none disabled:opacity-40"
          aria-label="Retirer 1"
        >
          {pendingSub ? "…" : "−"}
        </button>
      </form>
      <span className="font-mono text-text w-8 text-center tabular-nums">{quantity}</span>
      <form action={addAction}>
        <button
          type="submit"
          disabled={pendingSub || pendingAdd}
          className="w-6 h-6 rounded text-xs text-muted hover:text-text hover:bg-surface border border-border/50 leading-none disabled:opacity-40"
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
