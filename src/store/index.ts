import { configureStore } from '@reduxjs/toolkit'
import templatesReducer from './slices/templatesSlice'
import responsesReducer from './slices/responsesSlice'
import builderUiReducer from './slices/builderUiSlice'
import fillReducer from './slices/fillSlice'

// ─────────────────────────────────────────────────────────────────────────────
// Store factory (exported so tests can create isolated instances)
// ─────────────────────────────────────────────────────────────────────────────

export function makeStore() {
  return configureStore({
    reducer: {
      templates: templatesReducer,
      responses: responsesReducer,
      builderUi: builderUiReducer,
      fill: fillReducer,
    },
    // RTK's default middleware includes redux-thunk and serializability checks.
    // We intentionally keep defaults — no additional middleware needed.
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton store for the app
// ─────────────────────────────────────────────────────────────────────────────

export const store = makeStore()

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript helpers
// ─────────────────────────────────────────────────────────────────────────────

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
