"use client";

import * as React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import type {
  SingleSelectField,
  SelectOption,
  SingleSelectDisplayType,
} from "@/entities/field";
import { updateField } from "@/store/slices/templatesSlice";
import { setDirty } from "@/store/slices/builderUiSlice";
import { generateId, cn } from "@/lib/utils";
import { ChevronUpIcon, ChevronDownIcon, XIcon } from "@/shared/ui";
import { BaseFieldConfig } from "./BaseFieldConfig";
import { ConfigRow } from "./ConfigRow";
import { ConfigDivider } from "./ConfigDivider";
import { ConfigSection } from "./ConfigSection";

interface SingleSelectConfigProps {
  templateId: string;
  field: SingleSelectField;
}

export function SingleSelectConfig({
  templateId,
  field,
}: SingleSelectConfigProps) {
  const dispatch = useDispatch<AppDispatch>();

  function update(changes: Partial<Omit<SingleSelectField, "id" | "type">>) {
    dispatch(updateField({ templateId, fieldId: field.id, changes }));
    dispatch(setDirty(true));
  }

  function updateOption(optionId: string, label: string) {
    const newOptions = field.options.map((o) =>
      o.id === optionId ? { ...o, label } : o
    );
    update({ options: newOptions });
  }

  function removeOption(optionId: string) {
    update({ options: field.options.filter((o) => o.id !== optionId) });
  }

  function addOption() {
    const newOption: SelectOption = {
      id: generateId(),
      label: `Option ${field.options.length + 1}`,
    };
    update({ options: [...field.options, newOption] });
  }

  function moveOption(index: number, direction: "up" | "down") {
    const newOptions = [...field.options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOptions.length) return;
    const temp = newOptions[targetIndex];
    newOptions[targetIndex] = newOptions[index];
    newOptions[index] = temp;
    update({ options: newOptions });
  }

  const DISPLAY_OPTIONS: { value: SingleSelectDisplayType; label: string }[] = [
    { value: "radio", label: "Radio buttons" },
    { value: "dropdown", label: "Dropdown" },
    { value: "tiles", label: "Tiles" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <BaseFieldConfig
        label={field.label}
        onLabelChange={(v) => update({ label: v })}
        defaultRequired={field.defaultRequired}
        onRequiredChange={(v) => update({ defaultRequired: v })}
        defaultVisibility={field.defaultVisibility}
        onVisibilityChange={(v) => update({ defaultVisibility: v })}
      />

      <ConfigDivider />

      <ConfigSection title="Display">
        <ConfigRow label="Display Type">
          <div className="flex gap-1 p-0.5 bg-sidebar rounded-sm border border-border">
            {DISPLAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ displayType: opt.value })}
                className={cn(
                  "flex-1 py-1 text-[10px] font-medium rounded-[3px] transition-colors",
                  field.displayType === opt.value
                    ? "bg-surface text-primary shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </ConfigRow>
      </ConfigSection>

      <ConfigDivider />

      <ConfigSection title="Options">
        <div className="flex flex-col gap-2">
          {field.options.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-1.5">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  aria-label="Move option up"
                  onClick={() => moveOption(i, "up")}
                  disabled={i === 0}
                  className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronUpIcon />
                </button>
                <button
                  type="button"
                  aria-label="Move option down"
                  onClick={() => moveOption(i, "down")}
                  disabled={i === field.options.length - 1}
                  className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronDownIcon />
                </button>
              </div>

              <input
                type="text"
                value={opt.label}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="
                  flex-1 h-7 px-2 text-xs text-text-primary
                  bg-surface border border-border rounded-sm
                  placeholder:text-text-muted
                  focus:outline-none focus:border-primary
                  transition-colors
                "
              />

              <button
                type="button"
                aria-label="Remove option"
                onClick={() => removeOption(opt.id)}
                disabled={field.options.length <= 1}
                className={cn(
                  "p-1 rounded text-text-muted hover:text-red hover:bg-red-light",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  "transition-colors shrink-0"
                )}
              >
                <XIcon />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className={cn(
              "flex items-center gap-1.5 w-full py-1.5 px-3",
              "border border-dashed border-border rounded-sm",
              "text-[10px] text-text-muted hover:text-primary hover:border-primary",
              "transition-colors"
            )}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Add Option
          </button>
        </div>
      </ConfigSection>
    </div>
  );
}
