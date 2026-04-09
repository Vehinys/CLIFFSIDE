"use client";

import Image from "next/image";
import { useId, useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  metadata?: string | undefined;
  imageUrl?: string | null | undefined;
  extra?: React.ReactNode;
}

export function ViewModal({ open, onOpenChange, title, content, metadata, imageUrl, extra }: Props) {
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-border gap-4">
          <div className="flex-1 min-w-0">
            <h2 id={id} className="text-xl font-bold text-text">{title}</h2>
            {metadata && <p className="text-xs text-muted mt-1">{metadata}</p>}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted hover:text-text p-1 transition-colors shrink-0"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5L5 15M5 5l10 10" />
            </svg>
          </button>
        </div>

        {extra && <div className="mb-4">{extra}</div>}

        {imageUrl && (
          <div className="mb-5 rounded-lg border border-white/10 bg-surface/50 overflow-hidden flex items-center justify-center p-3 max-h-80">
            <Image
              src={imageUrl}
              alt=""
              width={600}
              height={400}
              className="max-h-72 w-auto object-contain"
              unoptimized
            />
          </div>
        )}

        <div className="text-sm text-text/90 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </>
  );
}
