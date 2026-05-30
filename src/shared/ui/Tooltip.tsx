"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Position classes for the tooltip bubble and arrow
// ─────────────────────────────────────────────────────────────────────────────

const bubblePosition: Record<NonNullable<TooltipProps["side"]>, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  return (
    <div className={cn("relative inline-flex group", className)}>
      {children}

      <div
        role="tooltip"
        className={cn(
          "absolute z-50 pointer-events-none",
          "px-2.5 py-1.5",
          "bg-text-primary text-white text-xs font-medium",
          "rounded-sm shadow-md",
          "whitespace-nowrap",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-150",
          bubblePosition[side]
        )}
      >
        {content}
      </div>
    </div>
  );
}
