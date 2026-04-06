"use client";

import { useId, useRef, useEffect } from "react";
import { TaskForm } from "./task-form";

interface Member {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  members: Member[];
  initialData?: Parameters<typeof TaskForm>[0]["initialData"];
  action: Parameters<typeof TaskForm>[0]["action"];
}

export function TaskModal({ open, onOpenChange, title, members, initialData, action }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const containerId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={containerId}
        className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <h2 id={containerId} className="text-xl font-bold text-text">{title}</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="text-muted hover:text-text p-1 transition-colors"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5L5 15M5 5l10 10"/></svg>
          </button>
        </div>
        
        <TaskForm 
          action={action} 
          members={members}
          initialData={initialData} 
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </div>
    </>
  );
}
