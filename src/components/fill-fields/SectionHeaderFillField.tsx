'use client'

import * as React from 'react'
import type { SectionHeaderField } from '@/entities/field'
import type { FieldValue } from '@/entities/response'
import { cn } from '@/lib/utils'

interface SectionHeaderFillFieldProps {
  field: SectionHeaderField
  value: FieldValue
  onChange: (value: FieldValue) => void
  onBlur: () => void
  error?: string[]
  isRequired: boolean
  isDisabled?: boolean
}

const SIZE_CLASSES: Record<SectionHeaderField['size'], string> = {
  xs: 'text-sm font-semibold',
  sm: 'text-base font-semibold',
  md: 'text-lg font-semibold',
  lg: 'text-xl font-bold',
  xl: 'text-2xl font-bold',
}

export const SectionHeaderFillField = React.memo(function SectionHeaderFillField({
  field,
}: SectionHeaderFillFieldProps) {
  const sizeClass = SIZE_CLASSES[field.size] ?? SIZE_CLASSES.md

  return (
    <div className="flex flex-col gap-1 pt-2">
      <h2 className={cn('text-text-primary', sizeClass)}>
        {field.label}
      </h2>
      <div className="border-b border-border" aria-hidden="true" />
    </div>
  )
})
