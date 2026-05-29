"use client";

import * as React from "react";
import type { SingleSelectField } from "@/entities/field";
import type { FieldValue } from "@/entities/response";
import { cn } from "@/lib/utils";

interface SingleSelectFillFieldProps {
  field: SingleSelectField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  error?: string[];
  isRequired: boolean;
  isDisabled?: boolean;
}

export const SingleSelectFillField = React.memo(function SingleSelectFillField({
  field,
  value,
  onChange,
  onBlur,
  error,
  isRequired,
  isDisabled = false,
}: SingleSelectFillFieldProps) {
  const inputId = `field-${field.id}`;
  const hasError = error && error.length > 0;
  // Value is a string[] of length 1 (option ID), or null
  const selectedId: string =
    Array.isArray(value) && value.length > 0 && typeof value[0] === "string"
      ? (value[0] as string)
      : typeof value === "string" && value
      ? value
      : "";

  function handleSelect(optionId: string) {
    onChange([optionId]);
  }

  if (field.displayType === "radio") {
    return (
      <fieldset className="flex flex-col gap-1.5" onBlur={onBlur}>
        <legend className="text-sm font-medium text-text-primary mb-1">
          {field.label}
          {isRequired && (
            <span className="text-red ml-1" aria-hidden="true">
              *
            </span>
          )}
        </legend>
        <div className="flex flex-col gap-2">
          {field.options.map((opt) => (
            <label
              key={opt.id}
              className={cn(
                "flex items-center gap-2.5 cursor-pointer group",
                isDisabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <input
                type="radio"
                name={inputId}
                value={opt.id}
                checked={selectedId === opt.id}
                disabled={isDisabled}
                onChange={() => handleSelect(opt.id)}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              <span className="text-sm text-text-primary group-hover:text-text-primary">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
        {hasError && (
          <ul className="flex flex-col gap-0.5 mt-1" role="alert">
            {error.map((msg, i) => (
              <li key={i} className="text-xs text-red">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    );
  }

  if (field.displayType === "dropdown") {
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
        <select
          id={inputId}
          value={selectedId}
          disabled={isDisabled}
          onChange={(e) => handleSelect(e.target.value)}
          onBlur={onBlur}
          aria-invalid={hasError ? true : undefined}
          className={cn(
            "w-full px-3 py-2 text-sm bg-surface rounded-sm border",
            "outline-none text-text-primary transition-colors appearance-none cursor-pointer",
            hasError ? "border-red" : "border-border focus:border-primary",
            isDisabled && "opacity-60 bg-sidebar cursor-not-allowed"
          )}
        >
          <option value="">Choose an option…</option>
          {field.options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError && (
          <ul className="flex flex-col gap-0.5" role="alert">
            {error.map((msg, i) => (
              <li key={i} className="text-xs text-red">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // tiles display type
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-text-primary">
        {field.label}
        {isRequired && (
          <span className="text-red ml-1" aria-hidden="true">
            *
          </span>
        )}
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={field.label}
      >
        {field.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={isDisabled}
              onClick={() => handleSelect(opt.id)}
              aria-pressed={isSelected}
              className={cn(
                "px-4 py-2 rounded-sm border text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "bg-primary border-primary text-white shadow-sm"
                  : "bg-surface border-border text-text-primary hover:border-primary/50 hover:bg-primary-light/30",
                isDisabled && "opacity-60 cursor-not-allowed"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {hasError && (
        <ul className="flex flex-col gap-0.5" role="alert">
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
