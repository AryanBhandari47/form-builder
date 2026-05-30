"use client";

import * as React from "react";
import type { DateField } from "@/entities/field";
import type { FieldValue } from "@/entities/response";
import { cn } from "@/lib/utils";

interface DateFillFieldProps {
  field: DateField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  error?: string[];
  isRequired: boolean;
  isDisabled?: boolean;
}

export const DateFillField = React.memo(function DateFillField({
  field,
  value,
  onChange,
  onBlur,
  error,
  isRequired,
  isDisabled = false,
}: DateFillFieldProps) {
  const inputId = `field-${field.id}`;
  const hasError = error && error.length > 0;
  const strValue = typeof value === "string" ? value : "";

  return (
    <div className="flex flex-col gap-1.5">
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

      <input
        id={inputId}
        type="date"
        value={strValue}
        min={field.minDate}
        max={field.maxDate}
        disabled={isDisabled}
        onChange={(e) => onChange(e.target.value || null)}
        onBlur={onBlur}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={cn(
          "w-full px-3 py-2 text-sm bg-surface rounded-sm border",
          "outline-none text-text-primary transition-colors",
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
