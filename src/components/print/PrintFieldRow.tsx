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
      <div className="mt-8 mb-4 flex items-center gap-3">
        <div className="w-1 self-stretch rounded-full bg-[#5B7FEF] shrink-0" />
        <h2 className={cn("text-gray-800", sizeClass)}>{field.label}</h2>
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

  const isEmpty = displayValue === "—";
  const isCalculation = field.type === "calculation";

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
        {field.label}
        {isCalculation && (
          <span className="ml-2 font-normal normal-case tracking-normal text-gray-300">
            calculated
          </span>
        )}
      </dt>
      <dd
        className={cn(
          "text-sm leading-relaxed",
          isEmpty ? "text-gray-300 italic" : "text-gray-800"
        )}
      >
        {displayValue}
      </dd>
    </div>
  );
}
