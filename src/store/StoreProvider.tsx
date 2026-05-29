'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from './index'

interface StoreProviderProps {
  children: React.ReactNode
}

/**
 * Client component that wraps the app with the Redux Provider.
 *
 * Uses a ref-stabilized store instance so that the store is created only once
 * per React tree, even in strict mode double-renders.
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null)

  if (storeRef.current === null) {
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
