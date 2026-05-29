/**
 * Calculation Engine
 *
 * Pure functions — no React, no Redux, no side effects.
 * Computes aggregated values for CalculationField instances.
 */

import type { FormField, CalculationField, AggregationType } from '../../entities/field'
import type { FieldValue } from '../../entities/response'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collect the numeric source values for a calculation field.
 * Rules:
 *  - Source fields must be number fields (calculation cannot source other calculations).
 *  - Only values from visible fields are included.
 *  - Null or non-numeric values are excluded.
 */
function collectSourceValues(
  field: CalculationField,
  values: Record<string, FieldValue>,
  allFields: Record<string, FormField>,
  visibility: Record<string, boolean>
): number[] {
  const result: number[] = []

  for (const sourceId of field.sourceFieldIds) {
    const sourceField = allFields[sourceId]

    // Skip if source field doesn't exist
    if (!sourceField) continue

    // Calculation fields cannot source other calculation fields
    if (sourceField.type === 'calculation') continue

    // Skip if the source field is hidden
    if (visibility[sourceId] === false) continue

    const rawValue = values[sourceId]

    // Only include actual numbers
    if (typeof rawValue === 'number' && isFinite(rawValue)) {
      result.push(rawValue)
    }
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregation functions
// ─────────────────────────────────────────────────────────────────────────────

function aggregate(nums: number[], type: AggregationType): number | null {
  if (nums.length === 0) return null

  switch (type) {
    case 'sum':
      return nums.reduce((acc, n) => acc + n, 0)

    case 'avg':
      return nums.reduce((acc, n) => acc + n, 0) / nums.length

    case 'min':
      return Math.min(...nums)

    case 'max':
      return Math.max(...nums)

    default: {
      const _exhaustive: never = type
      void _exhaustive
      return null
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the result for a single CalculationField.
 *
 * @param field        - The calculation field definition.
 * @param values       - Current form values map (fieldId → FieldValue).
 * @param allFields    - All field definitions for the form.
 * @param visibility   - Current visibility map (fieldId → boolean).
 * @returns The computed number rounded to `field.decimalPlaces`, or null if
 *          no valid source values are available.
 */
export function computeCalculation(
  field: CalculationField,
  values: Record<string, FieldValue>,
  allFields: Record<string, FormField>,
  visibility: Record<string, boolean>
): number | null {
  const sourceValues = collectSourceValues(field, values, allFields, visibility)
  const raw = aggregate(sourceValues, field.aggregation)

  if (raw === null) return null

  const factor = Math.pow(10, field.decimalPlaces)
  return Math.round(raw * factor) / factor
}

/**
 * Compute all calculation fields in the form.
 *
 * @param fieldIds   - Ordered array of all field IDs in the form.
 * @param fields     - All field definitions.
 * @param values     - Current form values map.
 * @param visibility - Current visibility map.
 * @returns Map of calculationFieldId → computed number | null.
 *          Only CalculationField IDs are present as keys.
 */
export function computeAllCalculations(
  fieldIds: string[],
  fields: Record<string, FormField>,
  values: Record<string, FieldValue>,
  visibility: Record<string, boolean>
): Record<string, number | null> {
  const result: Record<string, number | null> = {}

  for (const fieldId of fieldIds) {
    const field = fields[fieldId]
    if (!field || field.type !== 'calculation') continue

    // Skip hidden calculation fields
    if (visibility[fieldId] === false) continue

    result[fieldId] = computeCalculation(field, values, fields, visibility)
  }

  return result
}
