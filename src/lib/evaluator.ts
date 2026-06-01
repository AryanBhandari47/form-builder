/**
 * Conditional Logic Evaluator
 *
 * Pure functions — no React, no Redux, no side effects.
 * Given fields and current values, evaluates visibility and required state.
 */

import type {
  FormField,
  FieldCondition,
  ConditionalOperator,
  FieldType,
} from "@/entities/field";
import { isInputField } from "@/entities/field";
import type { FieldValue } from "@/entities/response";
import { getFieldEntry } from "@/lib/field-registry/registry";

// ─────────────────────────────────────────────────────────────────────────────
// Dependency graph
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps fieldId → set of fieldIds that have conditions targeting that field.
 * i.e. if fieldB has a condition targeting fieldA, then graph[fieldA] = {fieldB, ...}
 */
export type DependencyGraph = Record<string, Set<string>>;

/**
 * Build a dependency graph from a field map.
 * fieldA depends on fieldB if fieldA has a condition where targetFieldId === fieldB.
 *
 * @returns graph where graph[sourceId] = Set of fieldIds that read sourceId's value
 */
export function buildDependencyGraph(
  fields: Record<string, FormField>
): DependencyGraph {
  const graph: DependencyGraph = {};

  for (const [fieldId, field] of Object.entries(fields)) {
    for (const condition of field.conditions) {
      const { targetFieldId } = condition;

      // Skip self-references
      if (targetFieldId === fieldId) continue;

      if (!graph[targetFieldId]) {
        graph[targetFieldId] = new Set<string>();
      }
      graph[targetFieldId].add(fieldId);
    }
  }

  return graph;
}

// ─────────────────────────────────────────────────────────────────────────────
// Operator validity — single source: the field registry
// ─────────────────────────────────────────────────────────────────────────────

function isValidOperatorForType(
  fieldType: FormField["type"],
  operator: ConditionalOperator
): boolean {
  try {
    return getFieldEntry(fieldType).getSupportedOperators().includes(operator);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Single condition evaluation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluate a single FieldCondition against the current values.
 * Returns true if the condition passes (is met).
 */
function evaluateCondition(
  condition: FieldCondition,
  targetValue: FieldValue,
  targetFieldType: FieldType
): boolean {
  const { operator, value: conditionValue } = condition;

  // Guard: ensure operator is valid for this field type
  if (!isValidOperatorForType(targetFieldType, operator)) {
    return false;
  }

  switch (operator) {
    // ── Text ──────────────────────────────────────────────────────────────
    case "equals": {
      if (targetValue === null || targetValue === undefined) return false;
      const strVal = String(targetValue);
      return strVal === String(conditionValue);
    }

    case "not-equals": {
      if (targetValue === null || targetValue === undefined) return true;
      const strVal = String(targetValue);
      return strVal !== String(conditionValue);
    }

    case "contains": {
      if (targetValue === null || targetValue === undefined) return false;
      return String(targetValue)
        .toLowerCase()
        .includes(String(conditionValue).toLowerCase());
    }

    // ── Number ────────────────────────────────────────────────────────────
    case "greater-than": {
      if (typeof targetValue !== "number") return false;
      return targetValue > Number(conditionValue);
    }

    case "less-than": {
      if (typeof targetValue !== "number") return false;
      return targetValue < Number(conditionValue);
    }

    case "within-range": {
      if (typeof targetValue !== "number") return false;
      if (!Array.isArray(conditionValue) || conditionValue.length !== 2)
        return false;
      const [minStr, maxStr] = conditionValue as string[];
      const min = Number(minStr);
      const max = Number(maxStr);
      return targetValue >= min && targetValue <= max;
    }

    // ── Date ──────────────────────────────────────────────────────────────
    case "is-before": {
      if (typeof targetValue !== "string" || !targetValue) return false;
      return targetValue < String(conditionValue);
    }

    case "is-after": {
      if (typeof targetValue !== "string" || !targetValue) return false;
      return targetValue > String(conditionValue);
    }

    // ── Multi-Select ──────────────────────────────────────────────────────
    case "contains-any": {
      if (!Array.isArray(targetValue)) return false;
      if (!Array.isArray(conditionValue)) return false;
      const condArr = conditionValue as string[];
      return (targetValue as string[]).some((v) => condArr.includes(v));
    }

    case "contains-all": {
      if (!Array.isArray(targetValue)) return false;
      if (!Array.isArray(conditionValue)) return false;
      const condArr = conditionValue as string[];
      return condArr.every((v) => (targetValue as string[]).includes(v));
    }

    case "contains-none": {
      if (!Array.isArray(targetValue)) return true;
      if (!Array.isArray(conditionValue)) return true;
      const condArr = conditionValue as string[];
      return !(targetValue as string[]).some((v) => condArr.includes(v));
    }

    default: {
      // Exhaustive check — TypeScript will warn if we miss a case
      const _exhaustive: never = operator;
      void _exhaustive;
      return false;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Field-level evaluation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluate visibility for a single field.
 * Conditions use AND logic — ALL conditions must pass for an effect to apply.
 * The first matching effect group wins.
 *
 * Returns whether the field should be visible.
 */
export function evaluateFieldVisibility(
  field: FormField,
  values: Record<string, FieldValue>,
  fields: Record<string, FormField>
): boolean {
  const defaultVisible = field.defaultVisibility === "visible";

  if (field.conditions.length === 0) return defaultVisible;

  // Separate show/hide conditions from required/not-required conditions
  const visibilityConditions = field.conditions.filter(
    (c) => c.effect === "show" || c.effect === "hide"
  );

  if (visibilityConditions.length === 0) return defaultVisible;

  // All visibility conditions must pass (AND logic)
  const allPass = visibilityConditions.every((condition) => {
    // Skip self-referencing conditions
    if (condition.targetFieldId === field.id) return true;

    const targetField = fields[condition.targetFieldId];
    if (!targetField) return true; // target doesn't exist, skip

    const targetValue = values[condition.targetFieldId] ?? null;
    return evaluateCondition(condition, targetValue, targetField.type);
  });

  if (!allPass) return defaultVisible;

  // All conditions passed — apply the first visibility effect found
  const firstVisibilityEffect = visibilityConditions[0]?.effect;
  if (firstVisibilityEffect === "show") return true;
  if (firstVisibilityEffect === "hide") return false;

  return defaultVisible;
}

/**
 * Evaluate whether a field is required, given current values.
 * A hidden field is never required regardless of conditions.
 *
 * Returns whether the field is required.
 */
export function evaluateFieldRequired(
  field: FormField,
  values: Record<string, FieldValue>,
  fields: Record<string, FormField>,
  isVisible: boolean
): boolean {
  if (!isInputField(field.type)) return false;
  // A hidden field is never required
  if (!isVisible) return false;

  const requiredConditions = field.conditions.filter(
    (c) => c.effect === "mark-required" || c.effect === "mark-not-required"
  );

  if (requiredConditions.length === 0) return field.defaultRequired;

  const allPass = requiredConditions.every((condition) => {
    if (condition.targetFieldId === field.id) return true;

    const targetField = fields[condition.targetFieldId];
    if (!targetField) return true;

    const targetValue = values[condition.targetFieldId] ?? null;
    return evaluateCondition(condition, targetValue, targetField.type);
  });

  if (!allPass) return field.defaultRequired;

  const firstRequiredEffect = requiredConditions[0]?.effect;
  if (firstRequiredEffect === "mark-required") return true;
  if (firstRequiredEffect === "mark-not-required") return false;

  return field.defaultRequired;
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-form evaluation
// ─────────────────────────────────────────────────────────────────────────────

export interface EvaluationResult {
  visibility: Record<string, boolean>;
  required: Record<string, boolean>;
}

/**
 * Evaluate all fields in the form.
 * Returns visibility and required maps for every field.
 */
export function evaluateAll(
  fieldIds: string[],
  fields: Record<string, FormField>,
  values: Record<string, FieldValue>
): EvaluationResult {
  const visibility: Record<string, boolean> = {};
  const required: Record<string, boolean> = {};

  for (const fieldId of fieldIds) {
    const field = fields[fieldId];
    if (!field) continue;

    const isVisible = evaluateFieldVisibility(field, values, fields);
    const isRequired = evaluateFieldRequired(field, values, fields, isVisible);

    visibility[fieldId] = isVisible;
    required[fieldId] = isRequired;
  }

  return { visibility, required };
}
