'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import { upsertTemplate } from '../../store/slices/templatesSlice'
import { upsertManyResponses } from '../../store/slices/responsesSlice'
import { localStorageAdapter } from './localStorage.adapter'
import { seedDefaultTemplates } from './seedData'

/**
 * useStorageHydration
 *
 * Hydrates the Redux store from localStorage on mount.
 * If no templates exist, seeds default sample templates.
 * Should be called once near the root of the app (e.g. inside StoreProvider).
 *
 * Returns { isLoading: boolean } so the UI can show a skeleton while loading.
 */
export function useStorageHydration(): { isLoading: boolean } {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      try {
        // Seed sample data if no templates exist
        const seeded = await seedDefaultTemplates()
        if (cancelled) return

        // Load all templates (includes newly seeded ones)
        let templates = await localStorageAdapter.getTemplates()
        if (cancelled) return

        // If seedDefaultTemplates returned templates (freshly seeded), use those directly
        if (seeded.length > 0) {
          templates = seeded
        }

        // Load all templates into Redux
        for (const template of templates) {
          dispatch(upsertTemplate(template))
        }

        // Load all responses for each template
        const responseLoaders = templates.map((t) =>
          localStorageAdapter.getResponses(t.id)
        )
        const responseArrays = await Promise.all(responseLoaders)

        if (cancelled) return

        const allResponses = responseArrays.flat()
        if (allResponses.length > 0) {
          dispatch(upsertManyResponses(allResponses))
        }
      } catch (error) {
        console.error('[useStorageHydration] Failed to hydrate from storage:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [dispatch])

  return { isLoading }
}
