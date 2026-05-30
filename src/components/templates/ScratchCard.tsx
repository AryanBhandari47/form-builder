"use client";

import { IconPlus } from "@/shared/ui/Icons";

export function ScratchCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex flex-col items-center justify-center gap-3
        border-2 border-dashed border-border rounded-lg
        p-6 sm:p-8 text-center
        hover:border-primary hover:bg-primary-light
        transition-colors duration-150 cursor-pointer
        min-h-[160px] sm:min-h-[180px]
      "
    >
      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sidebar group-hover:bg-primary-light text-text-muted group-hover:text-primary transition-colors">
        <IconPlus />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
          Start from scratch
        </p>
        <p className="text-xs text-text-muted mt-0.5">Build a blank form</p>
      </div>
    </button>
  );
}
