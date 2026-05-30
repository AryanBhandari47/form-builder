"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import type { CalculationField, AggregationType } from "@/entities/field";
import { updateField } from "@/store/slices/templatesSlice";
import { setDirty } from "@/store/slices/builderUiSlice";
import { selectTemplateFields } from "@/store/selectors/templateSelectors";
import { Toggle } from "@/shared/ui";
import { ConfigRow } from "./ConfigRow";
import { ConfigDivider } from "./ConfigDivider";
import { ConfigSection } from "./ConfigSection";
import { cn } from "@/lib/utils";

interface CalculationConfigProps {
  templateId: string;
  field: CalculationField;
}

const AGGREGATION_OPTIONS: {
  value: AggregationType;
  label: string;
  description: string;
}[] = [
  { value: "sum", label: "Sum", description: "Add all values together" },
  { value: "avg", label: "Average", description: "Mean of all values" },
  { value: "min", label: "Minimum", description: "Smallest value" },
  { value: "max", label: "Maximum", description: "Largest value" },
];

export function CalculationConfig({
  templateId,
  field,
}: CalculationConfigProps) {
  const dispatch = useDispatch<AppDispatch>();

  const allFields = useSelector(
    (state: RootState) => selectTemplateFields(templateId)(state) ?? []
  );

  // Only number fields (excluding self)
  const numberFields = allFields.filter(
    (f) => f.type === "number" && f.id !== field.id
  );

  // Warn about any sourceFieldIds that no longer exist
  const missingFieldIds = field.sourceFieldIds.filter(
    (id) => !allFields.some((f) => f.id === id)
  );

  function update(changes: Partial<Omit<CalculationField, "id" | "type">>) {
    dispatch(updateField({ templateId, fieldId: field.id, changes }));
    dispatch(setDirty(true));
  }

  function toggleSourceField(fieldId: string) {
    const newIds = field.sourceFieldIds.includes(fieldId)
      ? field.sourceFieldIds.filter((id) => id !== fieldId)
      : [...field.sourceFieldIds, fieldId];
    update({ sourceFieldIds: newIds });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Label — no required toggle for calculation fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-primary">
            Field Label{" "}
            <span className="text-red" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
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

      <ConfigDivider />

      <ConfigSection title="Aggregation">
        <div className="grid grid-cols-2 gap-1.5">
          {AGGREGATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ aggregation: opt.value })}
              className={cn(
                "flex flex-col items-start gap-0.5 p-2 rounded-sm",
                "border text-left transition-colors",
                field.aggregation === opt.value
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border bg-surface text-text-primary hover:border-primary/40"
              )}
            >
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[10px] text-text-muted">
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </ConfigSection>

      <ConfigDivider />

      <ConfigSection title="Source Fields">
        {missingFieldIds.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-amber-light rounded-sm border border-amber/30 mb-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="text-amber shrink-0 mt-0.5"
            >
              <path
                d="M8 6v3M8 11v.5M1.5 13.5l6.5-11 6.5 11H1.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[10px] text-amber">
              {missingFieldIds.length} source field
              {missingFieldIds.length > 1 ? "s have" : " has"} been deleted.
            </p>
          </div>
        )}

        {numberFields.length === 0 ? (
          <p className="text-[10px] text-text-muted italic">
            No number fields in this form yet. Add a Number field to use as a
            source.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {numberFields.map((f) => {
              const isSelected = field.sourceFieldIds.includes(f.id);
              return (
                <label
                  key={f.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-sm cursor-pointer",
                    "border transition-colors",
                    isSelected
                      ? "border-primary bg-primary-light"
                      : "border-border bg-surface hover:border-primary/40"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSourceField(f.id)}
                    className="rounded border-border accent-primary"
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-primary" : "text-text-primary"
                    )}
                  >
                    {f.label}
                  </span>
                  {"prefix" in f && f.prefix && (
                    <span className="text-[10px] text-text-muted ml-auto">
                      {f.prefix}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </ConfigSection>

      <ConfigDivider />

      <ConfigSection title="Display">
        <ConfigRow label="Decimal Places">
          <select
            value={field.decimalPlaces}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10) as 0 | 1 | 2 | 3 | 4;
              update({ decimalPlaces: v });
            }}
            className="
              w-full h-8 px-3 text-xs text-text-primary
              bg-surface border border-border rounded-sm
              focus:outline-none focus:border-primary
              transition-colors appearance-none cursor-pointer
            "
          >
            <option value={0}>0 — Integer</option>
            <option value={1}>1 — e.g. 3.1</option>
            <option value={2}>2 — e.g. 3.14</option>
            <option value={3}>3 — e.g. 3.141</option>
            <option value={4}>4 — e.g. 3.1415</option>
          </select>
        </ConfigRow>
      </ConfigSection>
    </div>
  );
}
