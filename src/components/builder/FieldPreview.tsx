"use client";

import * as React from "react";
import type { FormField, SectionHeaderSize } from "@/entities/field";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Section header size → Tailwind classes
// ─────────────────────────────────────────────────────────────────────────────

const HEADER_SIZE_CLASSES: Record<SectionHeaderSize, string> = {
  xs: "text-xs font-semibold",
  sm: "text-sm font-semibold",
  md: "text-base font-bold",
  lg: "text-lg font-bold",
  xl: "text-xl font-bold",
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared preview input base
// ─────────────────────────────────────────────────────────────────────────────

const previewInput = cn(
  "w-full h-8 px-3 text-xs text-text-muted",
  "bg-sidebar border border-border rounded-sm",
  "pointer-events-none select-none"
);

const previewTextarea = cn(
  "w-full px-3 py-2 text-xs text-text-muted",
  "bg-sidebar border border-border rounded-sm",
  "pointer-events-none select-none resize-none"
);

// ─────────────────────────────────────────────────────────────────────────────
// Individual previews
// ─────────────────────────────────────────────────────────────────────────────

function SingleLinePreview({
  field,
}: {
  field: Extract<FormField, { type: "single-line" }>;
}) {
  const text = field.placeholder ?? "Enter text…";
  const content = (
    <div className={cn(previewInput, "flex items-center gap-1")}>
      {field.prefix && (
        <span className="text-text-muted shrink-0">{field.prefix}</span>
      )}
      <span className="truncate flex-1 text-text-muted italic">{text}</span>
      {field.suffix && (
        <span className="text-text-muted shrink-0">{field.suffix}</span>
      )}
    </div>
  );
  return content;
}

function MultiLinePreview({
  field,
}: {
  field: Extract<FormField, { type: "multi-line" }>;
}) {
  const rows = Math.min(Math.max(field.rows ?? 3, 2), 6);
  return (
    <div
      className={cn(previewTextarea)}
      style={{ minHeight: `${rows * 20}px` }}
    >
      <span className="italic text-text-muted">
        {field.placeholder ?? "Enter text…"}
      </span>
    </div>
  );
}

function NumberPreview({
  field,
}: {
  field: Extract<FormField, { type: "number" }>;
}) {
  return (
    <div className={cn(previewInput, "flex items-center gap-1")}>
      {field.prefix && (
        <span className="text-text-muted shrink-0">{field.prefix}</span>
      )}
      <span className="flex-1 italic text-text-muted">
        0{"0".repeat(field.decimalPlaces > 0 ? 1 : 0)}
        {field.decimalPlaces > 0 ? "." + "0".repeat(field.decimalPlaces) : ""}
      </span>
      {field.suffix && (
        <span className="text-text-muted shrink-0">{field.suffix}</span>
      )}
    </div>
  );
}

function DatePreview() {
  return (
    <div className={cn(previewInput, "flex items-center")}>
      <span className="italic text-text-muted">MM/DD/YYYY</span>
    </div>
  );
}

function SingleSelectPreview({
  field,
}: {
  field: Extract<FormField, { type: "single-select" }>;
}) {
  const opts = field.options.slice(0, 4);

  if (field.displayType === "dropdown") {
    return (
      <div className={cn(previewInput, "flex items-center justify-between")}>
        <span className="italic text-text-muted">
          {opts[0]?.label ?? "Select one…"}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (field.displayType === "tiles") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {opts.map((opt, i) => (
          <div
            key={opt.id}
            className={cn(
              "px-3 py-1 text-[10px] rounded-sm border text-text-muted",
              i === 0
                ? "border-primary bg-primary-light text-primary"
                : "border-border bg-sidebar"
            )}
          >
            {opt.label}
          </div>
        ))}
      </div>
    );
  }

  // radio (default)
  return (
    <div className="flex flex-col gap-1.5">
      {opts.map((opt, i) => (
        <div key={opt.id} className="flex items-center gap-2">
          <div
            className={cn(
              "w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center",
              i === 0 ? "border-primary bg-primary" : "border-border bg-sidebar"
            )}
          >
            {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <span className="text-[10px] text-text-muted">{opt.label}</span>
        </div>
      ))}
    </div>
  );
}

function MultiSelectPreview({
  field,
}: {
  field: Extract<FormField, { type: "multi-select" }>;
}) {
  const opts = field.options.slice(0, 4);
  return (
    <div className="flex flex-col gap-1.5">
      {opts.map((opt, i) => (
        <div key={opt.id} className="flex items-center gap-2">
          <div
            className={cn(
              "w-3.5 h-3.5 rounded-[3px] border shrink-0 flex items-center justify-center",
              i === 0 ? "border-primary bg-primary" : "border-border bg-sidebar"
            )}
          >
            {i === 0 && (
              <svg
                width="9"
                height="9"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 5l2.5 2.5L8 3"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-[10px] text-text-muted">{opt.label}</span>
        </div>
      ))}
    </div>
  );
}

function FileUploadPreview() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5",
        "border-2 border-dashed border-border rounded-md",
        "bg-sidebar py-4 px-3",
        "pointer-events-none"
      )}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="text-text-muted"
      >
        <path
          d="M8 10V3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5 6l3-3 3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 12.5h11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[10px] text-text-muted italic">
        Drop files here or click to upload
      </span>
    </div>
  );
}

function SectionHeaderPreview({
  field,
}: {
  field: Extract<FormField, { type: "section-header" }>;
}) {
  return (
    <div className="border-b border-border pb-1.5">
      <p className={cn(HEADER_SIZE_CLASSES[field.size], "text-text-primary")}>
        {field.label}
      </p>
    </div>
  );
}

function CalculationPreview({
  field,
}: {
  field: Extract<FormField, { type: "calculation" }>;
}) {
  const display = (0).toFixed(field.decimalPlaces);
  const aggLabel = {
    sum: "Sum",
    avg: "Average",
    min: "Minimum",
    max: "Maximum",
  }[field.aggregation];

  return (
    <div className={cn("flex items-center justify-between", previewInput)}>
      <span className="text-[10px] text-text-muted">
        {aggLabel} of {field.sourceFieldIds.length} field
        {field.sourceFieldIds.length !== 1 ? "s" : ""}
      </span>
      <span className="font-mono text-xs text-text-primary font-semibold">
        {display}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

interface FieldPreviewProps {
  field: FormField;
}

export function FieldPreview({ field }: FieldPreviewProps) {
  switch (field.type) {
    case "single-line":
      return <SingleLinePreview field={field} />;
    case "multi-line":
      return <MultiLinePreview field={field} />;
    case "number":
      return <NumberPreview field={field} />;
    case "date":
      return <DatePreview />;
    case "single-select":
      return <SingleSelectPreview field={field} />;
    case "multi-select":
      return <MultiSelectPreview field={field} />;
    case "file-upload":
      return <FileUploadPreview />;
    case "section-header":
      return <SectionHeaderPreview field={field} />;
    case "calculation":
      return <CalculationPreview field={field} />;
    default:
      return null;
  }
}
