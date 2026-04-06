"use client";

import { useState } from "react";

export function ExpandableText({ text, className = "" }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > 80;

  if (!isLong) {
    return <p className={`text-xs text-muted mt-0.5 ${className}`}>{text}</p>;
  }

  return (
    <div className={className}>
      <p className={`text-xs text-muted mt-0.5 whitespace-pre-wrap ${!expanded ? "line-clamp-2" : ""}`}>
        {text}
      </p>
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setExpanded(!expanded);
        }} 
        className="text-[10px] uppercase font-bold tracking-wider text-primary/80 hover:text-primary transition-colors mt-2"
      >
        {expanded ? "Voir moins" : "Voir tout le texte"}
      </button>
    </div>
  );
}
