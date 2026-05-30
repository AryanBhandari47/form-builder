'use client'

import * as React from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import type { FileUploadField } from '@/entities/field'
import { updateField } from '@/store/slices/templatesSlice'
import { setDirty } from '@/store/slices/builderUiSlice'
import { BaseFieldConfig } from './BaseFieldConfig'
import { ConfigRow } from './ConfigRow'
import { ConfigDivider } from './ConfigDivider'
import { ConfigSection } from './ConfigSection'
import { ConfigInput } from './ConfigInput'

interface FileUploadConfigProps {
  templateId: string
  field: FileUploadField
}

export function FileUploadConfig({ templateId, field }: FileUploadConfigProps) {
  const dispatch = useDispatch<AppDispatch>()

  function update(changes: Partial<Omit<FileUploadField, 'id' | 'type'>>) {
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

      <ConfigSection title="File Settings">
        <ConfigRow
          label="Allowed Types"
          hint="Comma-separated extensions or MIME types, e.g. image/*,.pdf"
        >
          <ConfigInput
            type="text"
            value={field.allowedTypes ?? ''}
            onChange={(e) => update({ allowedTypes: e.target.value || undefined })}
            placeholder="Any file type"
          />
        </ConfigRow>

        <ConfigRow label="Max Files" hint="Maximum number of files (1–10)">
          <ConfigInput
            type="number"
            min={1}
            max={10}
            value={field.maxFiles}
            onChange={(e) => {
              const v = Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1))
              update({ maxFiles: v })
            }}
          />
        </ConfigRow>
      </ConfigSection>
    </div>
  )
}
