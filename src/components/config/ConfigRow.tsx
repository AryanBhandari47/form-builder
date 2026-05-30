"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ConfigRowProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}

export function ConfigRow({
  label,
  children,
  hint,
  className,
}: ConfigRowProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-text-primary">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-text-muted">{hint}</p>}
    </div>
  );
}
