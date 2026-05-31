'use client'

import * as React from 'react'
import type { FieldType } from '@/entities/field'
import { cn } from '@/lib/utils'

export interface FieldIconProps {
  type: FieldType
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual icon SVGs (all 16x16 viewBox)
// ─────────────────────────────────────────────────────────────────────────────

function SingleLineIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <line x1="4" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MultiLineIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="1" y="1.5" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <line x1="4" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="4" y1="10.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function NumberIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Hash symbol */}
      <line x1="5" y1="2" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="2" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2.5" y1="6" x2="13.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function DateIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Calendar box */}
      <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      {/* Header bar */}
      <line x1="1.5" y1="6.5" x2="14.5" y2="6.5" stroke="currentColor" strokeWidth="1.25" />
      {/* Tab pegs */}
      <line x1="5" y1="1.5" x2="5" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="1.5" x2="11" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Day dots */}
      <circle cx="5" cy="10" r="1" fill="currentColor" />
      <circle cx="8" cy="10" r="1" fill="currentColor" />
      <circle cx="11" cy="10" r="1" fill="currentColor" />
    </svg>
  )
}

function SingleSelectIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
      {/* Inner filled dot */}
      <circle cx="8" cy="8" r="2.5" fill="currentColor" />
    </svg>
  )
}

function MultiSelectIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Top checkbox - checked */}
      <rect x="1.5" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3 4.5l1.2 1.2L6.5 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom checkbox - unchecked */}
      <rect x="1.5" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      {/* Lines for labels */}
      <line x1="9" y1="4.5" x2="14.5" y2="4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="9" y1="11.5" x2="14.5" y2="11.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function FileUploadIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Arrow up */}
      <path d="M8 10V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Base line */}
      <path d="M2.5 12.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SectionHeaderIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* "H1" style — H */}
      <path d="M2 3v10M2 8h5M7 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* "1" */}
      <path d="M11 5l1.5-1.5V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalculationIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Sigma / Σ shape */}
      <path
        d="M12 2H4l4.5 6L4 14h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon map
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<FieldType, React.FC<{ className?: string }>> = {
  'single-line': SingleLineIcon,
  'multi-line': MultiLineIcon,
  'number': NumberIcon,
  'date': DateIcon,
  'single-select': SingleSelectIcon,
  'multi-select': MultiSelectIcon,
  'file-upload': FileUploadIcon,
  'section-header': SectionHeaderIcon,
  'calculation': CalculationIcon,
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export function FieldIcon({ type, className }: FieldIconProps) {
  const Icon = ICON_MAP[type]
  return <Icon className={cn('text-current', className)} />
}
