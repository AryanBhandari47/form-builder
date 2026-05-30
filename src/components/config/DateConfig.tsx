'use client'

import * as React from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import type { DateField } from '@/entities/field'
import { updateField } from '@/store/slices/templatesSlice'
import { setDirty } from '@/store/slices/builderUiSlice'
import { Toggle } from '@/shared/ui'
import { BaseFieldConfig } from './BaseFieldConfig'
import { ConfigRow } from './ConfigRow'
import { ConfigDivider } from './ConfigDivider'
import { ConfigSection } from './ConfigSection'
import { ConfigInput } from './ConfigInput'

interface DateConfigProps {
  templateId: string
  field: DateField
}

export function DateConfig({ templateId, field }: DateConfigProps) {
  const dispatch = useDispatch<AppDispatch>()

  function update(changes: Partial<Omit<DateField, 'id' | 'type'>>) {
    dispatch(updateField({ templateId, fieldId: field.id, changes }))
    dispatch(setDirty(true))
  }

  return (
    <div className="flex flex-col gap-6">
      <BaseFieldConfig
        label={field.label}
        onLabelChange={(v) => update({ label: v })}
        defaultRequired={field.defaultRequired}
        onRequiredChange={(v) => update({ defaultRequired: v })}
        defaultVisibility={field.defaultVisibility}
        onVisibilityChange={(v) => update({ defaultVisibility: v })}
      />

      <ConfigDivider />

      <ConfigSection title="Defaults">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-primary">Pre-fill with today</span>
          <Toggle
            size="sm"
            checked={field.prefillToday}
            onChange={(v) => update({ prefillToday: v })}
          />
        </div>
      </ConfigSection>

      <ConfigDivider />

      <ConfigSection title="Date Range">
        <ConfigRow label="Min Date">
          <ConfigInput
            type="date"
            value={field.minDate ?? ''}
            onChange={(e) => update({ minDate: e.target.value || undefined })}
          />
        </ConfigRow>

        <ConfigRow label="Max Date">
          <ConfigInput
            type="date"
            value={field.maxDate ?? ''}
            onChange={(e) => update({ maxDate: e.target.value || undefined })}
          />
        </ConfigRow>
      </ConfigSection>
    </div>
  )
}
