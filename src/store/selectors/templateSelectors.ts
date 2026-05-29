import { createSelector } from 'reselect'
import type { RootState } from '../index'
import type { FormField } from '../../entities/field'
import {
  selectAllTemplatesFromAdapter,
  selectTemplateByIdFromAdapter,
} from '../slices/templatesSlice'

// ─────────────────────────────────────────────────────────────────────────────
// Base selectors
// ─────────────────────────────────────────────────────────────────────────────

const selectTemplatesState = (state: RootState) => state.templates

// ─────────────────────────────────────────────────────────────────────────────
// Memoized selectors
// ─────────────────────────────────────────────────────────────────────────────

/** All templates, sorted by updatedAt descending (adapter sort) */
export const selectAllTemplates = createSelector(
  selectTemplatesState,
  (state) => selectAllTemplatesFromAdapter(state)
)

/** Select a single template by ID */
export const selectTemplateById = (id: string) =>
  createSelector(
    selectTemplatesState,
    (state) => selectTemplateByIdFromAdapter(state, id) ?? null
  )

/**
 * Select an ordered array of FormField objects for a template.
 * Returns undefined if the template doesn't exist.
 */
export const selectTemplateFields = (templateId: string) =>
  createSelector(selectTemplatesState, (state): FormField[] | undefined => {
    const template = selectTemplateByIdFromAdapter(state, templateId)
    if (!template) return undefined

    return template.fieldIds
      .map((id) => template.fields[id])
      .filter((field): field is FormField => field !== undefined)
  })

/** Select the field map for a template */
export const selectTemplateFieldMap = (templateId: string) =>
  createSelector(selectTemplatesState, (state) => {
    const template = selectTemplateByIdFromAdapter(state, templateId)
    return template?.fields ?? {}
  })

/** Select the total count of templates */
export const selectTemplateCount = createSelector(
  selectTemplatesState,
  (state) => state.ids.length
)
