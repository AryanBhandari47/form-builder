"use client";

import type { FieldCondition, FormField } from "@/entities/field";

interface ConditionValueInputProps {
  condition: FieldCondition;
  targetField: FormField | undefined;
  onChange: (value: string | string[]) => void;
}

export function ConditionValueInput({
  condition,
  targetField,
  onChange,
}: ConditionValueInputProps) {
  if (!targetField) return null;

  const { operator } = condition;

  if (operator === "within-range") {
    const rangeValue = Array.isArray(condition.value) ? condition.value : ["", ""];
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={rangeValue[0] ?? ""}
          onChange={(e) => onChange([e.target.value, rangeValue[1] ?? ""])}
          placeholder="Min"
          className="flex-1 h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none"
        />
        <span className="text-xs text-text-muted">to</span>
        <input
          type="number"
          value={rangeValue[1] ?? ""}
          onChange={(e) => onChange([rangeValue[0] ?? "", e.target.value])}
          placeholder="Max"
          className="flex-1 h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none"
        />
      </div>
    );
  }

  if (
    (operator === "contains-any" ||
      operator === "contains-all" ||
      operator === "contains-none") &&
    (targetField.type === "multi-select" || targetField.type === "single-select") &&
    "options" in targetField
  ) {
    const selectedValues = Array.isArray(condition.value) ? condition.value : [];
    return (
      <div className="flex flex-col gap-1 mt-1">
        {targetField.options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedValues.includes(opt.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selectedValues, opt.id]);
                } else {
                  onChange(selectedValues.filter((v) => v !== opt.id));
                }
              }}
              className="rounded border-border accent-primary"
            />
            <span className="text-[11px] text-text-primary">{opt.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (targetField.type === "date") {
    return (
      <input
        type="date"
        value={typeof condition.value === "string" ? condition.value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none"
      />
    );
  }

  if (targetField.type === "number") {
    return (
      <input
        type="number"
        value={typeof condition.value === "string" ? condition.value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Value"
        className="w-full h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none"
      />
    );
  }

  if (targetField.type === "single-select" && "options" in targetField) {
    return (
      <select
        value={typeof condition.value === "string" ? condition.value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none appearance-none cursor-pointer"
      >
        <option value="">Select option…</option>
        {targetField.options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={typeof condition.value === "string" ? condition.value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value"
      className="w-full h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none"
    />
  );
}
