"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <p className="text-lg font-semibold text-text">Une erreur est survenue</p>
      <p className="text-sm text-muted max-w-sm">{error.message || "Erreur inattendue. Réessaye ou contacte un administrateur."}</p>
      <Button onClick={reset} variant="secondary">Réessayer</Button>
    </div>
  );
}
