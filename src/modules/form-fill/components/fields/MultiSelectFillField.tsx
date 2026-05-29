'use client'

import * as React from 'react'
import type { MultiSelectField } from '@/entities/field'
import type { FieldValue } from '@/entities/response'
import { cn } from '@/lib/utils'

interface MultiSelectFillFieldProps {
  field: MultiSelectField
  value: FieldValue
  onChange: (value: FieldValue) => void
  onBlur: () => void
  error?: string[]
  isRequired: boolean
  isDisabled?: boolean
}

export const MultiSelectFillField = React.memo(function MultiSelectFillField({
  field,
  value,
  onChange,
  onBlur,
  error,
  isRequired,
  isDisabled = false,
}: MultiSelectFillFieldProps) {
  const inputId = `field-${field.id}`
  const hasError = error && error.length > 0
  const selectedIds: string[] = Array.isArray(value) ? (value as string[]) : []

  function handleToggle(optionId: string) {
    const next = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId]
    onChange(next.length > 0 ? next : null)
  }

  return (
    <fieldset className="flex flex-col gap-1.5" onBlur={onBlur}>
      <legend className="text-sm font-medium text-text-primary mb-1">
        {field.label}
        {isRequired && <span className="text-red ml-1" aria-hidden="true">*</span>}
        {(field.minSelections !== undefined || field.maxSelections !== undefined) && (
          <span className="text-text-muted font-normal ml-2 text-xs">
            {field.minSelections !== undefined && field.maxSelections !== undefined
              ? `(select ${field.minSelections}–${field.maxSelections})`
              : field.minSelections !== undefined
              ? `(select at least ${field.minSelections})`
              : `(select at most ${field.maxSelections})`}
          </span>
        )}
      </legend>

      <div className="flex flex-col gap-2">
        {field.options.map((opt) => {
          const checked = selectedIds.includes(opt.id)
          return (
            <label
              key={opt.id}
              className={cn(
                'flex items-center gap-2.5 cursor-pointer group',
                isDisabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <input
                type="checkbox"
                id={`${inputId}-${opt.id}`}
                checked={checked}
                disabled={isDisabled}
                onChange={() => handleToggle(opt.id)}
                className="w-4 h-4 rounded accent-[var(--color-primary)]"
              />
              <span className="text-sm text-text-primary">
                {opt.label}
              </span>
            </label>
          )
        })}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-xs text-text-muted">
          {selectedIds.length} selected
        </p>
      )}

      {hasError && (
        <ul className="flex flex-col gap-0.5 mt-1" role="alert">
          {error.map((msg, i) => (
            <li key={i} className="text-xs text-red">{msg}</li>
          ))}
        </ul>
      )}
    </fieldset>
  )
})
