'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, error, hint, prefix, suffix, className, id, ...rest },
    ref
  ) {
    const inputId = id ?? React.useId()
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'flex items-center w-full gap-2',
            'bg-surface border rounded-[var(--radius-md)]',
            'transition-colors duration-[var(--transition-fast)]',
            hasError
              ? 'border-red'
              : 'border-border hover:border-text-muted'
          )}
        >
          {prefix && (
            <span className="pl-3 flex-shrink-0 text-text-muted">{prefix}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              'flex-1 min-w-0 h-9 bg-transparent',
              'text-sm text-text-primary placeholder:text-text-muted',
              'outline-none',
              prefix ? 'pl-0' : 'pl-3',
              suffix ? 'pr-0' : 'pr-3',
              'py-0',
              className
            )}
            {...rest}
          />

          {suffix && (
            <span className="pr-3 flex-shrink-0 text-text-muted">{suffix}</span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
