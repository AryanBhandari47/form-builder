import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { FieldValue } from '../../entities/response'

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

export interface FillState {
  /** The template being filled (null when not in fill mode) */
  templateId: string | null
  /** Current field values keyed by fieldId */
  values: Record<string, FieldValue>
  /** Whether each field has been interacted with (for showing errors) */
  touched: Record<string, boolean>
  /** Validation errors per field */
  errors: Record<string, string[]>
  /** Whether the form is currently being submitted */
  isSubmitting: boolean
  /** Evaluated visibility per field (computed by the conditional engine) */
  visibility: Record<string, boolean>
  /** Evaluated required state per field (computed by the conditional engine) */
  required: Record<string, boolean>
}

const initialState: FillState = {
  templateId: null,
  values: {},
  touched: {},
  errors: {},
  isSubmitting: false,
  visibility: {},
  required: {},
}

// ─────────────────────────────────────────────────────────────────────────────
// Payload types
// ─────────────────────────────────────────────────────────────────────────────

interface InitFillPayload {
  templateId: string
  /** Pre-evaluated visibility (before any user interaction) */
  initialVisibility: Record<string, boolean>
  /** Pre-evaluated required state (before any user interaction) */
  initialRequired: Record<string, boolean>
  /** Pre-filled values (e.g. from date prefill) */
  initialValues?: Record<string, FieldValue>
}

interface SetFieldValuePayload {
  fieldId: string
  value: FieldValue
}

interface SetErrorsPayload {
  errors: Record<string, string[]>
}

interface SetEvaluationsPayload {
  visibility: Record<string, boolean>
  required: Record<string, boolean>
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice — NOT persisted to storage
// ─────────────────────────────────────────────────────────────────────────────

const fillSlice = createSlice({
  name: 'fill',
  initialState,
  reducers: {
    /** Initialize fill mode for a template */
    initFill(state, action: PayloadAction<InitFillPayload>) {
      const { templateId, initialVisibility, initialRequired, initialValues } =
        action.payload
      state.templateId = templateId
      state.values = initialValues ?? {}
      state.touched = {}
      state.errors = {}
      state.isSubmitting = false
      state.visibility = initialVisibility
      state.required = initialRequired
    },

    /** Update a single field's value */
    setFieldValue(state, action: PayloadAction<SetFieldValuePayload>) {
      const { fieldId, value } = action.payload
      state.values[fieldId] = value
    },

    /** Mark a field as touched (user has interacted with it) */
    setFieldTouched(state, action: PayloadAction<string>) {
      state.touched[action.payload] = true
    },

    /** Set validation errors (replaces the entire errors map) */
    setErrors(state, action: PayloadAction<SetErrorsPayload>) {
      state.errors = action.payload.errors
    },

    /** Update the submission flag */
    setSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload
    },

    /** Update evaluated visibility and required maps after value changes */
    setEvaluations(state, action: PayloadAction<SetEvaluationsPayload>) {
      state.visibility = action.payload.visibility
      state.required = action.payload.required
    },

    /** Reset fill state (e.g. after successful submission or navigation away) */
    resetFill(_state) {
      return initialState
    },
  },
})

export const {
  initFill,
  setFieldValue,
  setFieldTouched,
  setErrors,
  setSubmitting,
  setEvaluations,
  resetFill,
} = fillSlice.actions

export default fillSlice.reducer
