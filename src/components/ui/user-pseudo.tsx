"use client";

import { cn } from "@/lib/utils";

interface UserPseudoProps {
  name: string | null;
  color?: string | null | undefined;
  className?: string;
  fallback?: string;
}

/**
 * Composant pour afficher le pseudo d'un utilisateur avec la couleur de son rôle.
 */
export function UserPseudo({ name, color, className, fallback = "—" }: UserPseudoProps) {
  if (!name) return <span className={cn("text-muted italic", className)}>{fallback}</span>;

  return (
    <span 
      style={{ color: color || undefined }} 
      className={cn("font-medium transition-colors", className)}
    >
      {name}
    </span>
  );
}
