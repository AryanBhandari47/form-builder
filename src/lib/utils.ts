import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { nanoid } from 'nanoid'
import { isInputField, type FieldType } from '@/entities/field'

// ─────────────────────────────────────────────────────────────────────────────
// Styling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merge Tailwind class names with deduplication.
 * Combines clsx (conditional classes) and tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ─────────────────────────────────────────────────────────────────────────────
// ID generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe unique ID using nanoid.
 * Default length is 21 characters.
 */
export function generateId(): string {
  return nanoid()
}

// ─────────────────────────────────────────────────────────────────────────────
// Date formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format an ISO datetime string as a localized date + time string.
 * Example: "May 28, 2024, 2:34 PM"
 */
export function formatDate(iso: string): string {
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return iso

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return iso
  }
}

/**
 * Format an ISO datetime string as a relative time string.
 * Examples: "just now", "2 minutes ago", "3 hours ago", "yesterday", "2 days ago"
 * Falls back to formatDate for older dates (> 30 days).
 */
export function formatRelativeDate(iso: string): string {
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return iso

    const now = Date.now()
    const diffMs = now - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 30) return 'just now'
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`
    if (diffMinutes === 1) return '1 minute ago'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return '1 week ago'
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

    // Older than 30 days — fall back to absolute date
    return formatDate(iso)
  } catch {
    return iso
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Number formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a number with a fixed number of decimal places.
 */
export function formatNumber(value: number, decimalPlaces: number): string {
  return value.toFixed(Math.max(0, Math.min(4, decimalPlaces)))
}

// ─────────────────────────────────────────────────────────────────────────────
// Object utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type-safe object entries.
 */
export function typedEntries<K extends string, V>(
  obj: Record<K, V>
): Array<[K, V]> {
  return Object.entries(obj) as Array<[K, V]>
}

/**
 * Type-safe object keys.
 */
export function typedKeys<K extends string>(obj: Record<K, unknown>): K[] {
  return Object.keys(obj) as K[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Response helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract the first text-like value from a form response.
 */
export function getFirstTextValue(response: { templateSnapshot: { fieldIds: string[]; fields: Record<string, { type: string }> }; values: Record<string, unknown> }): string {
  const { fieldIds, fields } = response.templateSnapshot
  for (const id of fieldIds) {
    const field = fields[id]
    if (!field) continue
    if (field.type === 'single-line' || field.type === 'multi-line') {
      const val = response.values[id]
      if (typeof val === 'string' && val.trim()) return val.trim()
    }
  }
  return '—'
}

/**
 * Calculate the completion percentage of a form response.
 */
export function getCompletionPercentage(response: { templateSnapshot: { fieldIds: string[]; fields: Record<string, { type: string }> }; values: Record<string, unknown> }): number {
  const { fieldIds, fields } = response.templateSnapshot
  const inputFields = fieldIds.filter((id) => {
    const f = fields[id]
    return f && isInputField(f.type as FieldType)
  })
  if (inputFields.length === 0) return 0
  const filled = inputFields.filter(
    (id) => response.values[id] !== null && response.values[id] !== undefined
  ).length
  return Math.round((filled / inputFields.length) * 100)
}

// ─────────────────────────────────────────────────────────────────────────────
// File helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a byte count to a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
