'use client'

import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, hint, options, placeholder, className, id, ...rest },
    ref
  ) {
    const generatedId = useId()
    const selectId = id ?? generatedId
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                ? `${selectId}-hint`
                : undefined
            }
            className={cn(
              'w-full appearance-none bg-surface border rounded-md',
              'h-9 pl-3 pr-8 text-sm text-text-primary',
              'transition-colors duration-(--transition-fast)',
              'focus:outline-none',
              'cursor-pointer',
              hasError
                ? 'border-red'
                : 'border-border hover:border-text-muted',
              className
            )}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
