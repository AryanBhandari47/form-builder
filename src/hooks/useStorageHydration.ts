"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { upsertMany } from "@/store/slices/templatesSlice";
import { upsertManyResponses } from "@/store/slices/responsesSlice";
import { setStorageReady } from "@/store/slices/appSlice";
import { storageAdapter } from "@/lib/storage";
// import { seedDefaultTemplates } from '@/lib/storage/seedData'

/**
 * useStorageHydration
 *
 * Hydrates the Redux store from localStorage on mount.
 * Dispatches setStorageReady(true) when complete so components can gate
 * on this global signal instead of using local isHydrated state.
 *
 * Returns { isLoading: boolean } for components that need it locally.
 */
export function useStorageHydration(): { isLoading: boolean } {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        // Seeding disabled — users start with a blank slate
        // const seeded = await seedDefaultTemplates()

        // Load all templates from localStorage
        const templates = await storageAdapter.getTemplates();
        if (cancelled) return;

        dispatch(upsertMany(templates));

        // Load all responses for each template
        const responseLoaders = templates.map((t) =>
          storageAdapter.getResponses(t.id)
        );
        const responseArrays = await Promise.all(responseLoaders);

        if (cancelled) return;

        const allResponses = responseArrays.flat();
        if (allResponses.length > 0) {
          dispatch(upsertManyResponses(allResponses));
        }
      } catch (error) {
        console.error(
          "[useStorageHydration] Failed to hydrate from storage:",
          error
        );
      } finally {
        if (!cancelled) {
          dispatch(setStorageReady());
          setIsLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return { isLoading };
}
