import {
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import type { FormResponse } from '../../entities/response'

// ─────────────────────────────────────────────────────────────────────────────
// Entity adapter
// ─────────────────────────────────────────────────────────────────────────────

const responsesAdapter = createEntityAdapter<FormResponse>({
  sortComparer: (a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
})

export const responsesInitialState = responsesAdapter.getInitialState()

export type ResponsesState = typeof responsesInitialState

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const responsesSlice = createSlice({
  name: 'responses',
  initialState: responsesInitialState,
  reducers: {
    /** Persist a new submitted response */
    addResponse: responsesAdapter.addOne,

    /** Remove a response by ID */
    removeResponse: responsesAdapter.removeOne,

    /** Bulk-load responses (e.g. on hydration from storage) */
    upsertManyResponses: responsesAdapter.upsertMany,
  },
})

export const { addResponse, removeResponse, upsertManyResponses } =
  responsesSlice.actions

export const {
  selectAll: selectAllResponsesFromAdapter,
  selectById: selectResponseByIdFromAdapter,
} = responsesAdapter.getSelectors()

export default responsesSlice.reducer
