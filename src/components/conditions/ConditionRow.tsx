"use client";

import type {
  FormField,
  FieldCondition,
  ConditionalOperator,
  ConditionEffect,
} from "@/entities/field";
import { ConditionValueInput } from "./ConditionValueInput";

const OPERATOR_LABELS: Record<ConditionalOperator, string> = {
  equals: "equals",
  "not-equals": "does not equal",
  contains: "contains",
  "greater-than": "is greater than",
  "less-than": "is less than",
  "within-range": "is within range",
  "contains-any": "contains any of",
  "contains-all": "contains all of",
  "contains-none": "contains none of",
  "is-before": "is before",
  "is-after": "is after",
};

const EFFECT_LABELS: Record<ConditionEffect, string> = {
  show: "Show this field",
  hide: "Hide this field",
  "mark-required": "Make required",
  "mark-not-required": "Make optional",
};

export function getOperatorsForField(field: FormField): ConditionalOperator[] {
  switch (field.type) {
    case "single-line":
    case "multi-line":
      return ["equals", "not-equals", "contains"];
    case "number":
      return ["equals", "greater-than", "less-than", "within-range"];
    case "date":
      return ["equals", "is-before", "is-after"];
    case "single-select":
      return ["equals", "not-equals"];
    case "multi-select":
      return ["contains-any", "contains-all", "contains-none"];
    default:
      return [];
  }
}

interface ConditionRowProps {
  condition: FieldCondition;
  otherFields: FormField[];
  onChange: (updated: FieldCondition) => void;
  onRemove: () => void;
}

export function ConditionRow({
  condition,
  otherFields,
  onChange,
  onRemove,
}: ConditionRowProps) {
  const targetField = otherFields.find((f) => f.id === condition.targetFieldId);
  const operators = targetField ? getOperatorsForField(targetField) : [];

  function handleTargetChange(fieldId: string) {
    const newTarget = otherFields.find((f) => f.id === fieldId);
    const newOperators = newTarget ? getOperatorsForField(newTarget) : [];
    onChange({
      ...condition,
      targetFieldId: fieldId,
      operator: newOperators[0] ?? condition.operator,
      value: "",
    });
  }

  function handleOperatorChange(op: ConditionalOperator) {
    onChange({ ...condition, operator: op, value: "" });
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-sidebar border border-border rounded-md">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-muted font-medium w-10 shrink-0">
          When
        </span>
        <div className="flex-1 min-w-0">
          <select
            value={condition.targetFieldId}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-full h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Select field…</option>
            {otherFields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          aria-label="Remove condition"
          onClick={onRemove}
          className="p-1 text-text-muted hover:text-red hover:bg-red-light rounded transition-colors shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {condition.targetFieldId && operators.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted font-medium w-10 shrink-0" />
          <div className="flex-1 min-w-0">
            <select
              value={condition.operator}
              onChange={(e) => handleOperatorChange(e.target.value as ConditionalOperator)}
              className="w-full h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none appearance-none cursor-pointer"
            >
              {operators.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {condition.targetFieldId && (
        <div className="flex items-start gap-2">
          <span className="text-[10px] text-text-muted font-medium w-10 shrink-0 mt-1.5" />
          <div className="flex-1 min-w-0">
            <ConditionValueInput
              condition={condition}
              targetField={targetField}
              onChange={(value) => onChange({ ...condition, value })}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-muted font-medium w-10 shrink-0">
          Then
        </span>
        <div className="flex-1 min-w-0">
          <select
            value={condition.effect}
            onChange={(e) =>
              onChange({ ...condition, effect: e.target.value as ConditionEffect })
            }
            className="w-full h-7 px-2 text-xs text-text-primary bg-surface border border-border rounded-sm focus:outline-none appearance-none cursor-pointer"
          >
            {(Object.entries(EFFECT_LABELS) as [ConditionEffect, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
