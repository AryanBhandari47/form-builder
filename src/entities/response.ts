/**
 * FormResponse entity — a single filled-in submission of a FormTemplate.
 */

import type { FormField } from './field'

// ─────────────────────────────────────────────────────────────────────────────
// Value types
// ─────────────────────────────────────────────────────────────────────────────

/** Metadata captured when a user "uploads" a file (no actual bytes stored) */
export interface FileMetadata {
  name: string
  /** File size in bytes */
  size: number
  /** MIME type, e.g. "image/png" */
  type: string
}

/**
 * The value stored for a single field in a response.
 *
 * - string       → single-line, multi-line, date (ISO date string)
 * - number       → number, calculation
 * - string[]     → single-select (array of 1), multi-select
 * - FileMetadata[] → file-upload
 * - null         → field was visible but left empty, or was hidden
 */
export type FieldValue = string | number | string[] | FileMetadata[] | null

// ─────────────────────────────────────────────────────────────────────────────
// Template snapshot (denormalized copy at submission time)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A point-in-time snapshot of the template structure at the moment a response
 * was submitted. This lets us render responses correctly even after the
 * template has been edited.
 */
export interface TemplateSnapshot {
  fieldIds: string[]
  fields: Record<string, FormField>
}

// ─────────────────────────────────────────────────────────────────────────────
// Response entity
// ─────────────────────────────────────────────────────────────────────────────

export interface FormResponse {
  id: string
  templateId: string
  /** Captured at submission time so responses still display correctly if the
   *  template title is later changed */
  templateTitle: string
  /** Full snapshot of the template structure at the moment of submission */
  templateSnapshot: TemplateSnapshot
  /** fieldId → value at submission time */
  values: Record<string, FieldValue>
  /** fieldId → whether the field was visible when the form was submitted */
  visibilityMap: Record<string, boolean>
  /** ISO 8601 datetime string */
  submittedAt: string
}

/**
 * Lightweight response metadata for list views.
 */
export interface FormResponseMeta {
  id: string
  templateId: string
  templateTitle: string
  submittedAt: string
  /** Number of fields that had non-null values */
  filledFieldCount: number
}

/** Derive metadata from a full response */
export function toResponseMeta(response: FormResponse): FormResponseMeta {
  const filledFieldCount = Object.values(response.values).filter(
    (v) => v !== null
  ).length

  return {
    id: response.id,
    templateId: response.templateId,
    templateTitle: response.templateTitle,
    submittedAt: response.submittedAt,
    filledFieldCount,
  }
}
