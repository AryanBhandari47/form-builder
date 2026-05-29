'use client'

import * as React from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import type { SingleLineField } from '@/entities/field'
import { updateField } from '@/store/slices/templatesSlice'
import { setDirty } from '@/store/slices/builderUiSlice'
import { BaseFieldConfig } from './BaseFieldConfig'
import { ConfigRow } from './ConfigRow'
import { ConfigDivider } from './ConfigDivider'
import { ConfigSection } from './ConfigSection'
import { ConfigInput } from './ConfigInput'

interface SingleLineConfigProps {
  templateId: string
  field: SingleLineField
}

export function SingleLineConfig({ templateId, field }: SingleLineConfigProps) {
  const dispatch = useDispatch<AppDispatch>()

  function update(changes: Partial<Omit<SingleLineField, 'id' | 'type'>>) {
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

      <ConfigSection title="Display">
        <ConfigRow label="Placeholder">
          <ConfigInput
            type="text"
            value={field.placeholder ?? ''}
            onChange={(e) => update({ placeholder: e.target.value || undefined })}
            placeholder="Enter placeholder text…"
          />
        </ConfigRow>

        <ConfigRow label="Prefix">
          <ConfigInput
            type="text"
            value={field.prefix ?? ''}
            onChange={(e) => update({ prefix: e.target.value || undefined })}
            placeholder="e.g. $"
          />
        </ConfigRow>

        <ConfigRow label="Suffix">
          <ConfigInput
            type="text"
            value={field.suffix ?? ''}
            onChange={(e) => update({ suffix: e.target.value || undefined })}
            placeholder="e.g. USD"
          />
        </ConfigRow>
      </ConfigSection>

      <ConfigDivider />

      <ConfigSection title="Validation">
        <ConfigRow label="Min Length">
          <ConfigInput
            type="number"
            min={0}
            value={field.minLength ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? undefined : Math.max(0, parseInt(e.target.value, 10))
              update({ minLength: v })
            }}
            placeholder="No minimum"
          />
        </ConfigRow>

        <ConfigRow label="Max Length">
          <ConfigInput
            type="number"
            min={1}
            value={field.maxLength ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? undefined : Math.max(1, parseInt(e.target.value, 10))
              update({ maxLength: v })
            }}
            placeholder="No maximum"
          />
        </ConfigRow>
      </ConfigSection>
    </div>
  )
}
