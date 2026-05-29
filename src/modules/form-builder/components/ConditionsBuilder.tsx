"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import type {
  FormField,
  FieldCondition,
  ConditionalOperator,
  ConditionEffect,
} from "@/entities/field";
import { updateFieldConditions } from "@/store/slices/templatesSlice";
import { setDirty } from "@/store/slices/builderUiSlice";
import { selectTemplateFields } from "@/store/selectors/templateSelectors";
import { generateId, cn } from "@/lib/utils";
import { Toggle } from "@/shared/ui";
import { updateField } from "@/store/slices/templatesSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Operator labels
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Get supported operators for a field type
// ─────────────────────────────────────────────────────────────────────────────

function getOperatorsForField(field: FormField): ConditionalOperator[] {
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

// ─────────────────────────────────────────────────────────────────────────────
// Value input — depends on operator + target field
// ─────────────────────────────────────────────────────────────────────────────

interface ValueInputProps {
  condition: FieldCondition;
  targetField: FormField | undefined;
  onChange: (value: string | string[]) => void;
}

function ConditionValueInput({
  condition,
  targetField,
  onChange,
}: ValueInputProps) {
  if (!targetField) return null;

  const { operator } = condition;

  if (operator === "within-range") {
    const rangeValue = Array.isArray(condition.value)
      ? condition.value
      : ["", ""];
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
    (targetField.type === "multi-select" ||
      targetField.type === "single-select") &&
    "options" in targetField
  ) {
    const selectedValues = Array.isArray(condition.value)
      ? condition.value
      : [];
    return (
      <div className="flex flex-col gap-1 mt-1">
        {targetField.options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2 cursor-pointer"
          >
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

  // Default: text input
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

// ─────────────────────────────────────────────────────────────────────────────
// Single condition row
// ─────────────────────────────────────────────────────────────────────────────

interface ConditionRowProps {
  condition: FieldCondition;
  otherFields: FormField[];
  onChange: (updated: FieldCondition) => void;
  onRemove: () => void;
}

function ConditionRow({
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
    <div className="flex flex-col gap-2 p-3 bg-sidebar border border-border rounded-[var(--radius-md)]">
      {/* When [target field] row */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-muted font-medium w-10 flex-shrink-0">
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
          className="p-1 text-text-muted hover:text-red hover:bg-red-light rounded transition-colors flex-shrink-0"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Operator row */}
      {condition.targetFieldId && operators.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted font-medium w-10 flex-shrink-0"></span>
          <div className="flex-1 min-w-0">
            <select
              value={condition.operator}
              onChange={(e) =>
                handleOperatorChange(e.target.value as ConditionalOperator)
              }
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

      {/* Value input */}
      {condition.targetFieldId && (
        <div className="flex items-start gap-2">
          <span className="text-[10px] text-text-muted font-medium w-10 flex-shrink-0 mt-1.5"></span>
          <div className="flex-1 min-w-0">
            <ConditionValueInput
              condition={condition}
              targetField={targetField}
              onChange={(value) => onChange({ ...condition, value })}
            />
          </div>
        </div>
      )}

      {/* Effect row */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-muted font-medium w-10 flex-shrink-0">
          Then
        </span>
        <div className="flex-1 min-w-0">
          <select
            value={condition.effect}
            onChange={(e) =>
              onChange({
                ...condition,
                effect: e.target.value as ConditionEffect,
              })
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

// ─────────────────────────────────────────────────────────────────────────────
// ConditionsBuilder
// ─────────────────────────────────────────────────────────────────────────────

interface ConditionsBuilderProps {
  templateId: string;
  fieldId: string;
}

export function ConditionsBuilder({
  templateId,
  fieldId,
}: ConditionsBuilderProps) {
  const dispatch = useDispatch<AppDispatch>();

  const allFields = useSelector(
    (state: RootState) => selectTemplateFields(templateId)(state) ?? []
  );

  const currentField = allFields.find((f) => f.id === fieldId);
  const otherFields = allFields.filter(
    (f) =>
      f.id !== fieldId &&
      f.type !== "section-header" &&
      f.type !== "calculation"
  );

  const conditions: FieldCondition[] = currentField?.conditions ?? [];

  function updateConditions(newConditions: FieldCondition[]) {
    dispatch(
      updateFieldConditions({ templateId, fieldId, conditions: newConditions })
    );
    dispatch(setDirty(true));
  }

  function handleAddCondition() {
    const defaultTargetField = otherFields[0];
    const defaultOperators = defaultTargetField
      ? getOperatorsForField(defaultTargetField)
      : [];

    const newCondition: FieldCondition = {
      targetFieldId: defaultTargetField?.id ?? "",
      operator: defaultOperators[0] ?? "equals",
      value: "",
      effect: "show",
    };
    updateConditions([...conditions, newCondition]);
  }

  function handleUpdateCondition(index: number, updated: FieldCondition) {
    const newConditions = conditions.map((c, i) => (i === index ? updated : c));
    updateConditions(newConditions);
  }

  function handleRemoveCondition(index: number) {
    updateConditions(conditions.filter((_, i) => i !== index));
  }

  // Update defaultVisibility on the field itself
  function handleDefaultVisibilityChange(v: "visible" | "hidden") {
    dispatch(
      updateField({ templateId, fieldId, changes: { defaultVisibility: v } })
    );
    dispatch(setDirty(true));
  }

  function handleDefaultRequiredChange(v: boolean) {
    dispatch(
      updateField({ templateId, fieldId, changes: { defaultRequired: v } })
    );
    dispatch(setDirty(true));
  }

  if (!currentField) return null;

  const isDisplayOnly =
    currentField.type === "section-header" ||
    currentField.type === "calculation";

  return (
    <div className="flex flex-col gap-6">
      {/* Defaults */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Defaults
        </h4>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-primary">
              Default visibility
            </p>
            <p className="text-[10px] text-text-muted">
              When no conditions match
            </p>
          </div>
          <Toggle
            size="sm"
            checked={currentField.defaultVisibility === "visible"}
            onChange={(checked) =>
              handleDefaultVisibilityChange(checked ? "visible" : "hidden")
            }
          />
        </div>

        {!isDisplayOnly && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-primary">
                Default required
              </p>
              <p className="text-[10px] text-text-muted">
                When no conditions match
              </p>
            </div>
            <Toggle
              size="sm"
              checked={currentField.defaultRequired}
              onChange={handleDefaultRequiredChange}
            />
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Conditions list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Conditions
          </h4>
          {conditions.length > 0 && (
            <span className="text-[10px] text-text-muted bg-sidebar px-1.5 py-0.5 rounded-full">
              {conditions.length}
            </span>
          )}
        </div>

        {conditions.length > 1 && (
          <div className="flex items-center gap-2 text-[10px] text-text-muted bg-amber-light px-2 py-1.5 rounded-sm border border-amber/30">
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="text-amber flex-shrink-0"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 5v3.5M8 10.5v.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            All conditions must be true (AND logic)
          </div>
        )}

        {otherFields.length === 0 && conditions.length === 0 && (
          <p className="text-[10px] text-text-muted italic">
            Add other fields to this form to create conditions.
          </p>
        )}

        {conditions.map((condition, index) => (
          <ConditionRow
            key={index}
            condition={condition}
            otherFields={otherFields}
            onChange={(updated) => handleUpdateCondition(index, updated)}
            onRemove={() => handleRemoveCondition(index)}
          />
        ))}

        {otherFields.length > 0 && (
          <button
            type="button"
            onClick={handleAddCondition}
            className={cn(
              "flex items-center gap-1.5 w-full py-2 px-3",
              "border border-dashed border-border rounded-[var(--radius-md)]",
              "text-xs text-text-muted hover:text-primary hover:border-primary",
              "transition-colors"
            )}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Add Condition
          </button>
        )}
      </div>
    </div>
  );
}
