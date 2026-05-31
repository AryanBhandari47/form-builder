"use client";

import type { FormField, SectionHeaderField, CalculationField } from "@/entities/field";
import type { FileMetadata, FieldValue } from "@/entities/response";
import { getFieldEntry } from "@/lib/field-registry";
import { cn } from "@/lib/utils";

const SECTION_SIZE_CLASS: Record<SectionHeaderField["size"], string> = {
  xs: "text-sm font-semibold",
  sm: "text-base font-semibold",
  md: "text-lg font-semibold",
  lg: "text-xl font-bold",
  xl: "text-2xl font-bold",
};

interface PrintFieldRowProps {
  field: FormField;
  value: FieldValue;
}

export function PrintFieldRow({ field, value }: PrintFieldRowProps) {
  if (field.type === "section-header") {
    const sizeClass = SECTION_SIZE_CLASS[field.size] ?? "text-base font-semibold";
    return (
      <div className="mt-6 mb-2">
        <h2 className={cn("text-gray-800", sizeClass)}>{field.label}</h2>
        <hr className="border-gray-200 mt-1" />
      </div>
    );
  }

  let displayValue: string = "—";

  if (field.type === "file-upload") {
    const files = Array.isArray(value) ? (value as FileMetadata[]) : [];
    if (files.length > 0) {
      const fileNames = files.map((f) => f.name).join(", ");
      displayValue = `${files.length} file${files.length !== 1 ? "s" : ""} attached: ${fileNames}`;
    }
  } else if (field.type === "calculation") {
    const calcField = field as CalculationField;
    displayValue =
      typeof value === "number" ? value.toFixed(calcField.decimalPlaces) : "—";
  } else {
    try {
      const entry = getFieldEntry(field.type);
      displayValue = entry.pdfFormatter(field, value);
    } catch {
      displayValue = value !== null && value !== undefined ? String(value) : "—";
    }
  }

  const isCalculation = field.type === "calculation";

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {field.label}
        {isCalculation && (
          <span className="ml-2 text-[10px] font-normal normal-case text-gray-400">
            (calculated)
          </span>
        )}
      </dt>
      <dd className={cn("text-sm text-gray-800 break-words", displayValue === "—" && "text-gray-400 italic")}>
        {displayValue}
      </dd>
    </div>
  );
}
