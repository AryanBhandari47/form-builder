/**
 * Field Registry
 *
 * Server-importable module — no 'use client', no React imports.
 * React renderers (BuilderRenderer / FillRenderer) are registered separately
 * to keep this file usable in server components and API routes.
 */

import { z } from 'zod'
import type { FormField, FieldType, ConditionalOperator } from '@/entities/field'
import type { FieldValue } from '@/entities/response'

// ─────────────────────────────────────────────────────────────────────────────
// Registry Entry
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldRegistryEntry<T extends FormField = FormField> {
  /** Matches the FormField discriminant */
  type: T['type']
  /** Human-readable label, e.g. "Single Line Text" */
  label: string
  /** Lucide icon name string, e.g. "Type" */
  icon: string
  /**
   * Default configuration values for a new field of this type.
   * Excludes id, type, order, conditions, defaultVisibility, defaultRequired.
   */
  defaultConfig: Omit<
    T,
    'id' | 'type' | 'order' | 'conditions' | 'defaultVisibility' | 'defaultRequired'
  >
  /** Zod schema that validates the full field object */
  configSchema: z.ZodTypeAny
  /**
   * Returns an array of validation error messages for a given value.
   * An empty array means the value is valid.
   */
  validationRules: (
    field: T,
    value: FieldValue,
    isRequired: boolean
  ) => string[]
  /** Operators this field type supports when used as a condition target */
  getSupportedOperators: () => ConditionalOperator[]
  /**
   * Format the field value as a plain string for PDF/print output.
   */
  pdfFormatter: (field: T, value: FieldValue) => string
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal registry store
// ─────────────────────────────────────────────────────────────────────────────

const REGISTRY = new Map<FieldType, FieldRegistryEntry>()

/** Registration order — determines palette display order */
const REGISTRATION_ORDER: FieldType[] = []

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a field type. Called once per field type during app initialization.
 * Safe to call multiple times with the same type (last registration wins).
 */
export function registerField<T extends FormField>(
  entry: FieldRegistryEntry<T>
): void {
  if (!REGISTRY.has(entry.type)) {
    REGISTRATION_ORDER.push(entry.type)
  }
  REGISTRY.set(entry.type, entry as unknown as FieldRegistryEntry)
}

/**
 * Retrieve the registry entry for a specific field type.
 * Throws if the type has not been registered.
 */
export function getFieldEntry(type: FieldType): FieldRegistryEntry {
  const entry = REGISTRY.get(type)
  if (!entry) {
    throw new Error(
      `[FieldRegistry] No entry registered for type "${type}". ` +
        'Make sure src/lib/field-registry/index.ts is imported.'
    )
  }
  return entry
}

/**
 * Return all registry entries in the order they were registered.
 */
export function getAllFieldEntries(): FieldRegistryEntry[] {
  return REGISTRATION_ORDER.map((type) => {
    const entry = REGISTRY.get(type)
    if (!entry) throw new Error(`[FieldRegistry] Missing entry for type "${type}"`)
    return entry
  })
}

/**
 * Check if a field type has been registered.
 */
export function hasFieldEntry(type: FieldType): boolean {
  return REGISTRY.has(type)
}
