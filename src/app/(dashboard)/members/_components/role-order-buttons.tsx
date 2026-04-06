"use client";

import { useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
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
        variant="ghost"
        size="icon"
        className="h-5 w-5 text-muted hover:text-text"
        disabled={isFirst || isPending}
        onClick={() => handleMove("up")}
      >
        <ChevronUp className="h-3.5 w-3.5" />
        <span className="sr-only">Monter</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 text-muted hover:text-text"
        disabled={isLast || isPending}
        onClick={() => handleMove("down")}
      >
        <ChevronDown className="h-3.5 w-3.5" />
        <span className="sr-only">Descendre</span>
      </Button>
    </div>
  );
}
