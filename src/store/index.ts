import { configureStore } from '@reduxjs/toolkit'
import templatesReducer from './slices/templatesSlice'
import responsesReducer from './slices/responsesSlice'
import builderUiReducer from './slices/builderUiSlice'
import fillReducer from './slices/fillSlice'
import appReducer from './slices/appSlice'

// ─────────────────────────────────────────────────────────────────────────────
// Store factory (exported so tests can create isolated instances)
// ─────────────────────────────────────────────────────────────────────────────

export function makeStore() {
  return configureStore({
    reducer: {
      app: appReducer,
      templates: templatesReducer,
      responses: responsesReducer,
      builderUi: builderUiReducer,
      fill: fillReducer,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript helpers
// ─────────────────────────────────────────────────────────────────────────────

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

