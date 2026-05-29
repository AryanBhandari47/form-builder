"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

export interface SkeletonRowProps {
  className?: string;
}

export function SkeletonRow({ className }: SkeletonRowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center gap-4 px-4 py-3",
        "border-b border-border-subtle last:border-0",
        className
      )}
    >
      <Skeleton className="h-8 w-8 flex-shrink-0 rounded-sm" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
    </div>
  );
}
