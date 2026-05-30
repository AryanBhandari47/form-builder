"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-colors whitespace-nowrap",
        active
          ? "bg-primary-light text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-sidebar"
      )}
    >
      {children}
    </button>
  );
}
