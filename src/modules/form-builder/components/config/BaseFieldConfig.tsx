"use client";

import * as React from "react";
import { Toggle } from "@/shared/ui";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BaseFieldConfigProps {
  label: string;
  onLabelChange: (v: string) => void;
  defaultRequired: boolean;
  onRequiredChange: (v: boolean) => void;
  defaultVisibility: "visible" | "hidden";
  onVisibilityChange: (v: "visible" | "hidden") => void;
  /** Hide required toggle for display-only fields like section-header and calculation */
  hideRequired?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function BaseFieldConfig({
  label,
  onLabelChange,
  defaultRequired,
  onRequiredChange,
  defaultVisibility,
  onVisibilityChange,
  hideRequired = false,
}: BaseFieldConfigProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-primary">
          Field Label{" "}
          <span className="text-red" aria-hidden="true">
            *
          </span>
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="Enter label…"
          className="
            w-full h-8 px-3 text-xs text-text-primary
            bg-surface border border-border rounded-sm
            placeholder:text-text-muted
            focus:outline-none focus:border-primary
            transition-colors
          "
        />
      </div>

      {/* Required toggle */}
      {!hideRequired && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-primary">
            Required
          </span>
          <Toggle
            size="sm"
            checked={defaultRequired}
            onChange={onRequiredChange}
          />
        </div>
      )}

      {/* Default visibility toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-primary">
          Initially visible
        </span>
        <Toggle
          size="sm"
          checked={defaultVisibility === "visible"}
          onChange={(checked) =>
            onVisibilityChange(checked ? "visible" : "hidden")
          }
        />
      </div>
    </div>
  );
}
