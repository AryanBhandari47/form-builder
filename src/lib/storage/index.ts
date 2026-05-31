/**
 * Storage barrel — all consumers import from here.
 * Swap to IndexedDB by changing this one file:
 *   export { indexedDbAdapter } from './indexedDb.adapter'
 */
/** Re-export as `storageAdapter` so consumers are adapter-agnostic */
export { localStorageAdapter as storageAdapter, persistedTemplateIds } from './localStorage.adapter'
