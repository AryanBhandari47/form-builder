"use client";

import * as React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import type { SectionHeaderField, SectionHeaderSize } from "@/entities/field";
import { updateField } from "@/store/slices/templatesSlice";
import { setDirty } from "@/store/slices/builderUiSlice";
import { Toggle } from "@/shared/ui";
import { ConfigRow } from "./ConfigRow";
import { ConfigSection } from "./ConfigSection";

interface SectionHeaderConfigProps {
  templateId: string;
  field: SectionHeaderField;
}

const SIZE_OPTIONS: { value: SectionHeaderSize; label: string }[] = [
  { value: "xs", label: "XS — Extra Small" },
  { value: "sm", label: "SM — Small" },
  { value: "md", label: "MD — Medium" },
  { value: "lg", label: "LG — Large" },
  { value: "xl", label: "XL — Extra Large" },
];

export function SectionHeaderConfig({
  templateId,
  field,
}: SectionHeaderConfigProps) {
  const dispatch = useDispatch<AppDispatch>();

  function update(changes: Partial<Omit<SectionHeaderField, "id" | "type">>) {
    dispatch(updateField({ templateId, fieldId: field.id, changes }));
    dispatch(setDirty(true));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Label only — no required/visibility toggles for display-only fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-primary">
            Heading Text{" "}
            <span className="text-red" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Enter heading text…"
            className="
              w-full h-8 px-3 text-xs text-text-primary
              bg-surface border border-border rounded-sm
              placeholder:text-text-muted
              focus:outline-none focus:border-primary
              transition-colors
            "
          />
        </div>

        {/* Visibility toggle still applies */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-primary">
            Initially visible
          </span>
          <Toggle
            size="sm"
            checked={field.defaultVisibility === "visible"}
            onChange={(checked) =>
              update({ defaultVisibility: checked ? "visible" : "hidden" })
            }
          />
        </div>
      </div>

      <div className="h-px bg-border" />

      <ConfigSection title="Appearance">
        <ConfigRow label="Heading Size">
          <select
            value={field.size}
            onChange={(e) =>
              update({ size: e.target.value as SectionHeaderSize })
            }
            className="
              w-full h-8 px-3 text-xs text-text-primary
              bg-surface border border-border rounded-sm
              focus:outline-none focus:border-primary
              transition-colors appearance-none cursor-pointer
            "
          >
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </ConfigRow>
      </ConfigSection>
    </div>
  );
}
