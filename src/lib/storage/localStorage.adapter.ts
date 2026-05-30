/**
 * localStorage Storage Adapter
 *
 * Implements StorageAdapter using the browser's localStorage.
 *
 * Storage schema:
 *   fb:templates           → JSON array of template IDs (index)
 *   fb:template:{id}       → full FormTemplate JSON
 *   fb:responses:{tid}     → JSON array of response IDs for template {tid}
 *   fb:response:{id}       → full FormResponse JSON
 *
 * Writes use a 500ms debounce to batch rapid successive saves.
 */

import type { StorageAdapter } from './adapter'
import type { FormTemplate } from '@/entities/template'
import type { FormResponse } from '@/entities/response'

// ─────────────────────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────────────────────

const KEYS = {
  templateIndex: 'fb:templates',
  template: (id: string) => `fb:template:${id}`,
  responseIndex: (templateId: string) => `fb:responses:${templateId}`,
  response: (id: string) => `fb:response:${id}`,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Debounce utility
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => void

function debounce<T extends AnyFn>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: unknown, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, ms)
  } as T
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe localStorage wrappers
// ─────────────────────────────────────────────────────────────────────────────

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`[localStorage] Failed to write key "${key}":`, e)
  }
}

function lsRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Persisted template ID tracking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set of template IDs that are known to exist in localStorage.
 * Populated during getTemplates() (hydration) and on every saveTemplate().
 * Used by the dashboard to exclude in-memory-only (unsaved) templates.
 */
export const persistedTemplateIds = new Set<string>()

// ─────────────────────────────────────────────────────────────────────────────
// Template index helpers
// ─────────────────────────────────────────────────────────────────────────────

function readTemplateIndex(): string[] {
  return lsGet<string[]>(KEYS.templateIndex) ?? []
}

const writeTemplateIndex = debounce((ids: string[]) => {
  lsSet(KEYS.templateIndex, ids)
}, 500)

// ─────────────────────────────────────────────────────────────────────────────
// Response index helpers
// ─────────────────────────────────────────────────────────────────────────────

function readResponseIndex(templateId: string): string[] {
  return lsGet<string[]>(KEYS.responseIndex(templateId)) ?? []
}

// We need a version that captures templateId in closure per call
function writeResponseIndex(templateId: string, ids: string[]): void {
  // Immediate write for correctness; can be debounced per-template if needed
  lsSet(KEYS.responseIndex(templateId), ids)
}

// ─────────────────────────────────────────────────────────────────────────────
// LocalStorage Adapter implementation
// ─────────────────────────────────────────────────────────────────────────────

export class LocalStorageAdapter implements StorageAdapter {
  // ── Templates ────────────────────────────────────────────────────────────

  async getTemplates(): Promise<FormTemplate[]> {
    const ids = readTemplateIndex()
    const templates: FormTemplate[] = []

    for (const id of ids) {
      const template = lsGet<FormTemplate>(KEYS.template(id))
      if (template !== null) {
        persistedTemplateIds.add(id)
        templates.push(template)
      }
    }

    return templates
  }

  async getTemplate(id: string): Promise<FormTemplate | null> {
    return lsGet<FormTemplate>(KEYS.template(id))
  }

  async saveTemplate(template: FormTemplate): Promise<void> {
    lsSet(KEYS.template(template.id), template)
    persistedTemplateIds.add(template.id)

    const ids = readTemplateIndex()
    if (!ids.includes(template.id)) {
      ids.push(template.id)
      // Write index synchronously so a subsequent getTemplates() in the same
      // tick (e.g. seed backfill) sees the updated index immediately.
      lsSet(KEYS.templateIndex, ids)
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    lsRemove(KEYS.template(id))
    persistedTemplateIds.delete(id)

    const ids = readTemplateIndex().filter((i) => i !== id)
    writeTemplateIndex(ids)
  }

  // ── Responses ────────────────────────────────────────────────────────────

  async getResponses(templateId: string): Promise<FormResponse[]> {
    const ids = readResponseIndex(templateId)
    const responses: FormResponse[] = []

    for (const id of ids) {
      const response = lsGet<FormResponse>(KEYS.response(id))
      if (response !== null) {
        responses.push(response)
      }
    }

    return responses
  }

  async getResponse(id: string): Promise<FormResponse | null> {
    return lsGet<FormResponse>(KEYS.response(id))
  }

  async saveResponse(response: FormResponse): Promise<void> {
    // Write the full response
    lsSet(KEYS.response(response.id), response)

    // Update the per-template index
    const ids = readResponseIndex(response.templateId)
    if (!ids.includes(response.id)) {
      ids.push(response.id)
      writeResponseIndex(response.templateId, ids)
    }
  }

  async deleteResponse(id: string): Promise<void> {
    // We need the templateId to update the index; read the response first
    const response = lsGet<FormResponse>(KEYS.response(id))
    lsRemove(KEYS.response(id))

    if (response) {
      const ids = readResponseIndex(response.templateId).filter((i) => i !== id)
      writeResponseIndex(response.templateId, ids)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton instance
// ─────────────────────────────────────────────────────────────────────────────

export const localStorageAdapter = new LocalStorageAdapter()
