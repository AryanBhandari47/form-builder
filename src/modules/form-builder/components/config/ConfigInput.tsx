"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ConfigInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-8 px-3 text-xs text-text-primary",
        "bg-surface border border-border rounded-sm",
        "placeholder:text-text-muted",
        "focus:outline-none focus:border-primary",
        "transition-colors",
        props.className
      )}
    />
  );
}
