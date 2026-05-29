'use client'

import { useStorageHydration } from './hooks'

/**
 * StorageHydration
 *
 * Invisible client component that runs useStorageHydration() on mount,
 * loading persisted templates and responses from localStorage into Redux.
 * Renders nothing — it is purely a side-effect component.
 */
export function StorageHydration() {
  useStorageHydration()
  return null
}
