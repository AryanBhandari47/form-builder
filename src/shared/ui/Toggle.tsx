"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Size maps
// ─────────────────────────────────────────────────────────────────────────────

const trackSize: Record<NonNullable<ToggleProps["size"]>, string> = {
  sm: "w-8 h-4",
  md: "w-11 h-6",
};

const thumbSize: Record<NonNullable<ToggleProps["size"]>, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
};

const thumbTranslate: Record<NonNullable<ToggleProps["size"]>, string> = {
  sm: "translate-x-4",
  md: "translate-x-5",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function Toggle({
  checked,
  onChange,
  label,
  size = "md",
  disabled = false,
  id,
}: ToggleProps) {
  const generatedId = useId();
  const toggleId = id ?? generatedId;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 rounded-full",
          "transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          trackSize[size],
          checked ? "bg-primary" : "bg-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow",
            "transition-transform duration-200 ease-in-out",
            "absolute top-1/2 -translate-y-1/2",
            thumbSize[size],
            checked ? thumbTranslate[size] : "translate-x-0.5"
          )}
        />
      </button>

      {label && (
        <label
          htmlFor={toggleId}
          className={cn(
            "text-sm text-text-primary select-none",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          )}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
}
