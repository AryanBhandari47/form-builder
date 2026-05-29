import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

export type BuilderTab = 'build' | 'preview' | 'responses'

export interface BuilderUiState {
  /** Currently selected field ID in the builder canvas */
  selectedFieldId: string | null
  /** Whether there are unsaved changes */
  isDirty: boolean
  /** Active tab in the builder UI */
  activeTab: BuilderTab
  /** Search query for the field type palette */
  searchQuery: string
}

const initialState: BuilderUiState = {
  selectedFieldId: null,
  isDirty: false,
  activeTab: 'build',
  searchQuery: '',
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice — NOT persisted to storage
// ─────────────────────────────────────────────────────────────────────────────

const builderUiSlice = createSlice({
  name: 'builderUi',
  initialState,
  reducers: {
    /** Select a field in the builder canvas (null to deselect) */
    setSelectedField(state, action: PayloadAction<string | null>) {
      state.selectedFieldId = action.payload
    },

    /** Mark the current template as having unsaved changes */
    setDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload
    },

    /** Switch the active tab */
    setActiveTab(state, action: PayloadAction<BuilderTab>) {
      state.activeTab = action.payload
    },

    /** Update the field palette search query */
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },

    /** Reset all builder UI state (e.g. when navigating away) */
    resetBuilderUi(_state) {
      return initialState
    },
  },
})

export const {
  setSelectedField,
  setDirty,
  setActiveTab,
  setSearchQuery,
  resetBuilderUi,
} = builderUiSlice.actions

export default builderUiSlice.reducer
