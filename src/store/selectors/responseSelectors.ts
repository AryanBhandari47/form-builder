import { createSelector } from 'reselect'
import type { RootState } from '../index'
import {
  selectAllResponsesFromAdapter,
  selectResponseByIdFromAdapter,
} from '../slices/responsesSlice'

// ─────────────────────────────────────────────────────────────────────────────
// Base selectors
// ─────────────────────────────────────────────────────────────────────────────

const selectResponsesState = (state: RootState) => state.responses

// ─────────────────────────────────────────────────────────────────────────────
// Memoized selectors
// ─────────────────────────────────────────────────────────────────────────────

/** All responses, sorted by submittedAt descending (adapter sort) */
export const selectAllResponses = createSelector(
  selectResponsesState,
  (state) => selectAllResponsesFromAdapter(state)
)

/** Select a single response by ID */
export const selectResponseById = (id: string) =>
  createSelector(
    selectResponsesState,
    (state) => selectResponseByIdFromAdapter(state, id) ?? null
  )

/** Select all responses for a specific template, sorted by submittedAt descending */
export const selectResponsesByTemplateId = (templateId: string) =>
  createSelector(selectResponsesState, (state) => {
    const all = selectAllResponsesFromAdapter(state)
    return all.filter((r) => r.templateId === templateId)
  })

/** Count of responses for a specific template */
export const selectResponseCountForTemplate = (templateId: string) =>
  createSelector(selectResponsesState, (state) => {
    const all = selectAllResponsesFromAdapter(state)
    return all.filter((r) => r.templateId === templateId).length
  })
