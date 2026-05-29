"use client";

import * as React from "react";
import type { SingleLineField } from "@/entities/field";
import type { FieldValue } from "@/entities/response";
import { cn } from "@/lib/utils";

interface SingleLineFillFieldProps {
  field: SingleLineField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  error?: string[];
  isRequired: boolean;
  isDisabled?: boolean;
}

export const SingleLineFillField = React.memo(function SingleLineFillField({
  field,
  value,
  onChange,
  onBlur,
  error,
  isRequired,
  isDisabled = false,
}: SingleLineFillFieldProps) {
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

      <div
        className={cn(
          "flex items-center rounded-sm border bg-surface transition-colors",
          hasError ? "border-red" : "border-border focus-within:border-primary",
          isDisabled && "opacity-60 bg-sidebar"
        )}
      >
        {field.prefix && (
          <span className="px-3 py-2 text-sm text-text-secondary border-r border-border bg-sidebar rounded-l-sm select-none whitespace-nowrap">
            {field.prefix}
          </span>
        )}
        <input
          id={inputId}
          type="text"
          value={strValue}
          placeholder={field.placeholder ?? ""}
          disabled={isDisabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={cn(
            "flex-1 min-w-0 px-3 py-2 text-sm bg-transparent outline-none text-text-primary",
            "placeholder:text-text-muted",
            isDisabled && "cursor-not-allowed"
          )}
        />
        {field.suffix && (
          <span className="px-3 py-2 text-sm text-text-secondary border-l border-border bg-sidebar rounded-r-sm select-none whitespace-nowrap">
            {field.suffix}
          </span>
        )}
      </div>

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
