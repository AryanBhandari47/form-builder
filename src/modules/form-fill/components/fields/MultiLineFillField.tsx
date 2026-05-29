"use client";

import * as React from "react";
import type { MultiLineField } from "@/entities/field";
import type { FieldValue } from "@/entities/response";
import { cn } from "@/lib/utils";

interface MultiLineFillFieldProps {
  field: MultiLineField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  error?: string[];
  isRequired: boolean;
  isDisabled?: boolean;
}

export const MultiLineFillField = React.memo(function MultiLineFillField({
  field,
  value,
  onChange,
  onBlur,
  error,
  isRequired,
  isDisabled = false,
}: MultiLineFillFieldProps) {
  const inputId = `field-${field.id}`;
  const hasError = error && error.length > 0;
  const strValue = typeof value === "string" ? value : "";
  const showCharCount =
    field.minLength !== undefined || field.maxLength !== undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {field.label}
          {isRequired && (
            <span className="text-red ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {showCharCount && (
          <span className="text-xs text-text-muted tabular-nums">
            {strValue.length}
            {field.maxLength !== undefined && ` / ${field.maxLength}`}
            {" characters"}
          </span>
        )}
      </div>

      <textarea
        id={inputId}
        value={strValue}
        placeholder={field.placeholder ?? ""}
        rows={field.rows ?? 4}
        disabled={isDisabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={cn(
          "w-full px-3 py-2 text-sm bg-surface rounded-sm border",
          "outline-none text-text-primary placeholder:text-text-muted resize-y",
          "transition-colors",
          hasError ? "border-red" : "border-border focus:border-primary",
          isDisabled && "opacity-60 bg-sidebar cursor-not-allowed"
        )}
      />

      {hasError && (
        <ul
          id={`${inputId}-error`}
          className="flex flex-col gap-0.5"
          role="alert"
        >
          {error.map((msg, i) => (
            <li key={i} className="text-xs text-red">
              {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
