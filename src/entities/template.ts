/**
 * FormTemplate entity — represents a form design created in the builder.
 */

import type { FormField } from './field'

export interface FormTemplate {
  id: string
  title: string
  description?: string
  /** Ordered list of field IDs (defines display order) */
  fieldIds: string[]
  /** Normalized map of fieldId -> FormField */
  fields: Record<string, FormField>
  /** ISO 8601 datetime string */
  createdAt: string
  /** ISO 8601 datetime string */
  updatedAt: string
  /** Total number of responses submitted against this template */
  responseCount: number
}

/**
 * Lightweight template metadata used for list views.
 * Does not include the full field definitions to reduce payload size.
 */
export interface FormTemplateMeta {
  id: string
  title: string
  description?: string
  fieldCount: number
  createdAt: string
  updatedAt: string
  responseCount: number
}

/** Derive metadata from a full template */
export function toTemplateMeta(template: FormTemplate): FormTemplateMeta {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    fieldCount: template.fieldIds.length,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    responseCount: template.responseCount,
  }
}
