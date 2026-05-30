"use client";

import * as React from "react";
import type { CalculationField, FormField } from "@/entities/field";
import type { FieldValue } from "@/entities/response";
import { cn } from "@/lib/utils";

interface CalculationFillFieldProps {
  field: CalculationField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  error?: string[];
  isRequired: boolean;
  isDisabled?: boolean;
  allFields?: Record<string, FormField>;
}

export const CalculationFillField = React.memo(function CalculationFillField({
  field,
  value,
  allFields,
}: CalculationFillFieldProps) {
  const inputId = `field-${field.id}`;

  const displayValue =
    typeof value === "number" ? value.toFixed(field.decimalPlaces) : "—";

  // Build a human-readable aggregation label
  const aggLabel =
    field.aggregation === "sum"
      ? "Sum"
      : field.aggregation === "avg"
      ? "Average"
      : field.aggregation === "min"
      ? "Minimum"
      : "Maximum";

  const sourceLabels = field.sourceFieldIds
    .map((id) => allFields?.[id]?.label ?? id)
    .join(", ");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-text-primary"
      >
        {field.label}
      </label>
      {sourceLabels && (
        <p className="text-xs text-text-muted">
          {aggLabel} of: {sourceLabels}
        </p>
      )}
      <div
        id={inputId}
        aria-readonly="true"
        aria-label={`${field.label}: ${displayValue}`}
        className={cn(
          "flex items-center px-3 py-2 rounded-sm border border-border",
          "bg-sidebar text-text-secondary text-sm font-mono",
          "cursor-not-allowed select-all"
        )}
      >
        <span className="text-text-muted text-xs mr-2 font-sans">= </span>
        <span className="text-text-primary font-semibold tabular-nums">
          {displayValue}
        </span>
      </div>
    </div>
  );
});
