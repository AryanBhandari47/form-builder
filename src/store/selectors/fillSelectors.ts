import { createSelector } from 'reselect'
import type { RootState } from '../index'
import type { FormField } from '../../entities/field'

// ─────────────────────────────────────────────────────────────────────────────
// Base selectors
// ─────────────────────────────────────────────────────────────────────────────

const selectFillState = (state: RootState) => state.fill

export const selectFillTemplateId = (state: RootState) =>
  state.fill.templateId

export const selectFillValues = (state: RootState) => state.fill.values

export const selectFillTouched = (state: RootState) => state.fill.touched

export const selectFillErrors = (state: RootState) => state.fill.errors

export const selectFillVisibility = (state: RootState) => state.fill.visibility

export const selectFillRequired = (state: RootState) => state.fill.required

export const selectIsSubmitting = (state: RootState) => state.fill.isSubmitting

// ─────────────────────────────────────────────────────────────────────────────
// Derived / memoized selectors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Select the ordered set of visible fields given the current template and
 * visibility evaluation. Requires the field list from templates state.
 */
export const selectVisibleFields = (
  templateId: string,
  orderedFields: FormField[]
) =>
  createSelector(selectFillState, (fill) => {
    if (fill.templateId !== templateId) return []
    return orderedFields.filter((field) => fill.visibility[field.id] !== false)
  })

/** Whether a specific field is required in the current fill session */
export const selectIsFieldRequired = (fieldId: string) =>
  createSelector(selectFillState, (fill) => fill.required[fieldId] ?? false)

/** Whether a specific field is visible in the current fill session */
export const selectIsFieldVisible = (fieldId: string) =>
  createSelector(selectFillState, (fill) => fill.visibility[fieldId] !== false)

/** The current value of a specific field */
export const selectFieldValue = (fieldId: string) =>
  createSelector(selectFillValues, (values) => values[fieldId] ?? null)

/** The validation errors for a specific field */
export const selectFieldErrors = (fieldId: string) =>
  createSelector(selectFillErrors, (errors) => errors[fieldId] ?? [])

/** Whether the field has been touched */
export const selectIsFieldTouched = (fieldId: string) =>
  createSelector(selectFillTouched, (touched) => touched[fieldId] ?? false)

/**
 * Whether any visible+required field has validation errors.
 * Used to gate form submission.
 */
export const selectHasValidationErrors = createSelector(
  selectFillState,
  (fill) => {
    for (const [fieldId, fieldErrors] of Object.entries(fill.errors)) {
      if (
        fieldErrors.length > 0 &&
        fill.visibility[fieldId] !== false
      ) {
        return true
      }
    }
    return false
  }
)

/** Count of fields with errors that are visible */
export const selectVisibleErrorCount = createSelector(
  selectFillState,
  (fill) => {
    let count = 0
    for (const [fieldId, fieldErrors] of Object.entries(fill.errors)) {
      if (fieldErrors.length > 0 && fill.visibility[fieldId] !== false) {
        count++
      }
    }
    return count
  }
)
