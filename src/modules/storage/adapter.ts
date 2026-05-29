/**
 * Storage Adapter Interface
 *
 * Defines the contract for all storage implementations.
 * Server-importable — no React or browser APIs.
 */

import type { FormTemplate } from '../../entities/template'
import type { FormResponse } from '../../entities/response'

export interface StorageAdapter {
  // ── Templates ────────────────────────────────────────────────────────────

  /** Retrieve all templates (metadata + fields) */
  getTemplates(): Promise<FormTemplate[]>

  /** Retrieve a single template by ID, or null if not found */
  getTemplate(id: string): Promise<FormTemplate | null>

  /** Persist (create or update) a template */
  saveTemplate(template: FormTemplate): Promise<void>

  /** Delete a template by ID */
  deleteTemplate(id: string): Promise<void>

  // ── Responses ────────────────────────────────────────────────────────────

  /** Retrieve all responses for a given template */
  getResponses(templateId: string): Promise<FormResponse[]>

  /** Retrieve a single response by ID, or null if not found */
  getResponse(id: string): Promise<FormResponse | null>

  /** Persist a response */
  saveResponse(response: FormResponse): Promise<void>

  /** Delete a response by ID */
  deleteResponse(id: string): Promise<void>
}
