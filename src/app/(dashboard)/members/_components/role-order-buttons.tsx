"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { moveRole } from "../../roles/_actions";

interface RoleOrderButtonsProps {
  roleId: string;
  isFirst: boolean;
  isLast: boolean;
}

export function RoleOrderButtons({ roleId, isFirst, isLast }: RoleOrderButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleMove = (direction: "up" | "down") => {
    startTransition(async () => {
      await moveRole(roleId, direction);
    });
  };

  return (
    <div className="flex flex-col gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-muted hover:text-text"
        disabled={isFirst || isPending}
        onClick={() => handleMove("up")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        <span className="sr-only">Monter</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-muted hover:text-text"
        disabled={isLast || isPending}
        onClick={() => handleMove("down")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <span className="sr-only">Descendre</span>
      </Button>
    </div>
  );
}
