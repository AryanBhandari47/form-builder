'use client'

import { useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from './index'

interface StoreProviderProps {
  children: React.ReactNode
}

/**
 * Client component that wraps the app with the Redux Provider.
 *
 * Creates the store once via useState lazy initializer.
 * Stable across renders and compatible with React 19 strict lint rules.
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState<AppStore>(makeStore)

  return <Provider store={store}>{children}</Provider>
}
