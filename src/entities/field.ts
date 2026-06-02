/**
 * Field entity types — discriminated union covering all 10 field types.
 * This file is pure TypeScript with no React or Redux imports, so it can be
 * imported from server components and utility modules alike.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Primitive building blocks
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType =
  | "single-line"
  | "multi-line"
  | "number"
  | "date"
  | "single-select"
  | "multi-select"
  | "file-upload"
  | "section-header"
  | "calculation"
  | "rating";

export type ConditionalOperator =
  // Text operators
  | "equals"
  | "not-equals"
  | "contains"
  // Number operators
  | "greater-than"
  | "less-than"
  | "within-range"
  // Multi-select operators
  | "contains-any"
  | "contains-all"
  | "contains-none"
  // Date operators
  | "is-before"
  | "is-after";

export type ConditionEffect =
  | "show"
  | "hide"
  | "mark-required"
  | "mark-not-required";

// ─────────────────────────────────────────────────────────────────────────────
// Conditional Logic (cross-cutting concern)
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldCondition {
  /** The field whose value is evaluated */
  targetFieldId: string;
  operator: ConditionalOperator;
  /**
   * For most operators this is a single string.
   * For 'within-range' this is [min, max] as strings.
   * For multi-select operators ('contains-any' | 'contains-all' | 'contains-none')
   * this is an array of option values.
   */
  value: string | string[];
  effect: ConditionEffect;
}

// ─────────────────────────────────────────────────────────────────────────────
// Select option
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectOption {
  id: string;
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Base field — properties shared by all field types
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldBase {
  id: string;
  type: FieldType;
  /** Zero-based display order within the form */
  order: number;
  conditions: FieldCondition[];
  defaultVisibility: "visible" | "hidden";
  /**
   * Whether the field is required by default (before conditions are evaluated).
   * section-header and calculation fields never capture user input so this is
   * semantically false for them, but we keep the field for type uniformity.
   */
  defaultRequired: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Single-Line Text
// ─────────────────────────────────────────────────────────────────────────────

export interface SingleLineField extends FieldBase {
  type: "single-line";
  label: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Multi-Line Text
// ─────────────────────────────────────────────────────────────────────────────

export interface MultiLineField extends FieldBase {
  type: "multi-line";
  label: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  /** Number of visible textarea rows (default 4) */
  rows?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Number
// ─────────────────────────────────────────────────────────────────────────────

export interface NumberField extends FieldBase {
  type: "number";
  label: string;
  min?: number;
  max?: number;
  /** 0–4 decimal places */
  decimalPlaces: 0 | 1 | 2 | 3 | 4;
  prefix?: string;
  suffix?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Date
// ─────────────────────────────────────────────────────────────────────────────

export interface DateField extends FieldBase {
  type: "date";
  label: string;
  /** If true, the field is pre-filled with today's date */
  prefillToday: boolean;
  /** ISO date string YYYY-MM-DD */
  minDate?: string;
  /** ISO date string YYYY-MM-DD */
  maxDate?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Single Select
// ─────────────────────────────────────────────────────────────────────────────

export type SingleSelectDisplayType = "radio" | "dropdown" | "tiles";

export interface SingleSelectField extends FieldBase {
  type: "single-select";
  label: string;
  options: SelectOption[];
  displayType: SingleSelectDisplayType;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Multi Select
// ─────────────────────────────────────────────────────────────────────────────

export interface MultiSelectField extends FieldBase {
  type: "multi-select";
  label: string;
  options: SelectOption[];
  minSelections?: number;
  maxSelections?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. File Upload (metadata only — no actual file bytes stored)
// ─────────────────────────────────────────────────────────────────────────────

export interface FileUploadField extends FieldBase {
  type: "file-upload";
  label: string;
  /** Comma-separated MIME types or extensions, e.g. "image/*,.pdf" */
  allowedTypes?: string;
  maxFiles: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Section Header (non-input — for visual grouping)
// ─────────────────────────────────────────────────────────────────────────────

export type SectionHeaderSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface SectionHeaderField extends FieldBase {
  type: "section-header";
  label: string;
  size: SectionHeaderSize;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Calculation (read-only — computed from other numeric fields)
// ─────────────────────────────────────────────────────────────────────────────

export type AggregationType = "sum" | "avg" | "min" | "max";

export interface CalculationField extends FieldBase {
  type: "calculation";
  label: string;
  /** IDs of the source NumberFields (cannot reference other CalculationFields) */
  sourceFieldIds: string[];
  aggregation: AggregationType;
  /** 0–4 decimal places for result display */
  decimalPlaces: 0 | 1 | 2 | 3 | 4;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Rating
// ─────────────────────────────────────────────────────────────────────────────

export interface RatingField extends FieldBase {
  type: "rating";
  label: string;
  maxRating: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main discriminated union
// ─────────────────────────────────────────────────────────────────────────────

export type FormField =
  | SingleLineField
  | MultiLineField
  | NumberField
  | DateField
  | SingleSelectField
  | MultiSelectField
  | FileUploadField
  | SectionHeaderField
  | CalculationField
  | RatingField;

// ─────────────────────────────────────────────────────────────────────────────
// Utility type helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extract the field type that corresponds to a given FieldType string */
export type FieldByType<T extends FieldType> = Extract<FormField, { type: T }>;

/** The config portion of a field (everything except base BookField properties) */
export type FieldConfig<T extends FormField> = Omit<
  T,
  | "id"
  | "type"
  | "order"
  | "conditions"
  | "defaultVisibility"
  | "defaultRequired"
>;

/** Whether a field type captures user input (vs. display-only) */
export type InputFieldType = Exclude<
  FieldType,
  "section-header" | "calculation"
>;

/** Input-capturing fields */
export type InputFormField = FieldByType<InputFieldType>;

/** Runtime check — true if the field type captures user input */
export function isInputField(type: FieldType): boolean {
  return type !== "section-header" && type !== "calculation";
}
