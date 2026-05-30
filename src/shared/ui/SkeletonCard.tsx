"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-surface border border-border rounded-lg",
        "overflow-hidden",
        className
      )}
    >
      {/* Accent bar */}
      <Skeleton className="h-1 w-full rounded-none" />

      <div className="p-4 flex flex-col gap-3">
        {/* Icon + badge row */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-sm" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-4 w-3/4" />

        {/* Meta */}
        <Skeleton className="h-3 w-1/2" />

        {/* Divider */}
        <div className="border-t border-border-subtle" />

        {/* Buttons row */}
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  );
}
