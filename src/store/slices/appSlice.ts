import { createSlice } from '@reduxjs/toolkit'

interface AppState {
  /** True once useStorageHydration has finished loading localStorage into Redux */
  storageReady: boolean
}

const initialState: AppState = {
  storageReady: false,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setStorageReady(state) {
      state.storageReady = true
    },
  },
})

export const { setStorageReady } = appSlice.actions
export default appSlice.reducer
