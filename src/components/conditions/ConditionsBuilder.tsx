"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import type {
  FormField,
  FieldCondition,
} from "@/entities/field";
import { isInputField } from "@/entities/field";
import { updateFieldConditions } from "@/store/slices/templatesSlice";
import { setDirty } from "@/store/slices/builderUiSlice";
import { selectTemplateFields } from "@/store/selectors/templateSelectors";
import { getFieldEntry } from "@/lib/field-registry/registry";
import { cn } from "@/lib/utils";
import { Toggle } from "@/shared/ui";
import { updateField } from "@/store/slices/templatesSlice";
import { ConditionRow } from "./ConditionRow";

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
    (f) => f.id !== fieldId && isInputField(f.type)
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
      ? getFieldEntry(defaultTargetField.type).getSupportedOperators()
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

  const isDisplayOnly = !isInputField(currentField.type);

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
              className="text-amber shrink-0"
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
              "border border-dashed border-border rounded-md",
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
