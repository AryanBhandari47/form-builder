import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { FormTemplate } from '../../entities/template'
import type { FormField, FieldCondition } from '../../entities/field'

// ─────────────────────────────────────────────────────────────────────────────
// Entity adapter
// ─────────────────────────────────────────────────────────────────────────────

const templatesAdapter = createEntityAdapter<FormTemplate>({
  sortComparer: (a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
})

export const templatesInitialState = templatesAdapter.getInitialState()

export type TemplatesState = typeof templatesInitialState

// ─────────────────────────────────────────────────────────────────────────────
// Payload types
// ─────────────────────────────────────────────────────────────────────────────

interface AddFieldPayload {
  templateId: string
  field: FormField
}

interface RemoveFieldPayload {
  templateId: string
  fieldId: string
}

interface ReorderFieldsPayload {
  templateId: string
  orderedIds: string[]
}

interface UpdateFieldPayload {
  templateId: string
  fieldId: string
  changes: Partial<Omit<FormField, 'id' | 'type'>>
}

interface UpdateFieldConditionsPayload {
  templateId: string
  fieldId: string
  conditions: FieldCondition[]
}

interface UpdateTemplateTitlePayload {
  id: string
  title: string
}

interface UpdateTemplateDescriptionPayload {
  id: string
  description: string | undefined
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString()

const templatesSlice = createSlice({
  name: 'templates',
  initialState: templatesInitialState,
  reducers: {
    /** Insert or completely replace a template */
    upsertTemplate: templatesAdapter.upsertOne,

    /** Remove a template and all its fields */
    removeTemplate: templatesAdapter.removeOne,

    /** Update just the title of a template */
    updateTemplateTitle(
      state,
      action: PayloadAction<UpdateTemplateTitlePayload>
    ) {
      const { id, title } = action.payload
      const template = state.entities[id]
      if (template) {
        template.title = title
        template.updatedAt = now()
      }
    },

    /** Update just the description of a template */
    updateTemplateDescription(
      state,
      action: PayloadAction<UpdateTemplateDescriptionPayload>
    ) {
      const { id, description } = action.payload
      const template = state.entities[id]
      if (template) {
        template.description = description
        template.updatedAt = now()
      }
    },

    /** Add a new field to a template */
    addField(state, action: PayloadAction<AddFieldPayload>) {
      const { templateId, field } = action.payload
      const template = state.entities[templateId]
      if (!template) return

      template.fields[field.id] = field
      if (!template.fieldIds.includes(field.id)) {
        template.fieldIds.push(field.id)
      }
      template.updatedAt = now()
    },

    /** Remove a field from a template */
    removeField(state, action: PayloadAction<RemoveFieldPayload>) {
      const { templateId, fieldId } = action.payload
      const template = state.entities[templateId]
      if (!template) return

      delete template.fields[fieldId]
      template.fieldIds = template.fieldIds.filter((id) => id !== fieldId)
      template.updatedAt = now()
    },

    /** Re-order fields by providing a new complete ordered list of IDs */
    reorderFields(state, action: PayloadAction<ReorderFieldsPayload>) {
      const { templateId, orderedIds } = action.payload
      const template = state.entities[templateId]
      if (!template) return

      // Only include IDs that actually exist in the template
      template.fieldIds = orderedIds.filter((id) => id in template.fields)
      template.updatedAt = now()
    },

    /** Update properties of an existing field (partial update, type-safe) */
    updateField(state, action: PayloadAction<UpdateFieldPayload>) {
      const { templateId, fieldId, changes } = action.payload
      const template = state.entities[templateId]
      if (!template) return

      const existing = template.fields[fieldId]
      if (!existing) return

      // Merge changes — RTK uses Immer so this is safe
      Object.assign(existing, changes)
      template.updatedAt = now()
    },

    /** Replace the conditions array for a specific field */
    updateFieldConditions(
      state,
      action: PayloadAction<UpdateFieldConditionsPayload>
    ) {
      const { templateId, fieldId, conditions } = action.payload
      const template = state.entities[templateId]
      if (!template) return

      const field = template.fields[fieldId]
      if (!field) return

      field.conditions = conditions
      template.updatedAt = now()
    },

    /** Increment the response count (called after a response is submitted) */
    incrementResponseCount(state, action: PayloadAction<string>) {
      const template = state.entities[action.payload]
      if (template) {
        template.responseCount += 1
        template.updatedAt = now()
      }
    },
  },
})

export const {
  upsertTemplate,
  removeTemplate,
  updateTemplateTitle,
  updateTemplateDescription,
  addField,
  removeField,
  reorderFields,
  updateField,
  updateFieldConditions,
  incrementResponseCount,
} = templatesSlice.actions

export const { selectAll: selectAllTemplatesFromAdapter, selectById: selectTemplateByIdFromAdapter } =
  templatesAdapter.getSelectors()

export default templatesSlice.reducer
