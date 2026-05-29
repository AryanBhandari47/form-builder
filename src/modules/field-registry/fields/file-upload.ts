import { z } from 'zod'
import type { FileUploadField } from '../../../entities/field'
import type { FieldValue, FileMetadata } from '../../../entities/response'
import { registerField } from '../registry'

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  allowedTypes: z.string().optional(),
  maxFiles: z.number().int().min(1).max(20),
})

registerField<FileUploadField>({
  type: 'file-upload',
  label: 'File Upload',
  icon: 'Upload',
  defaultConfig: {
    label: 'Upload Files',
    maxFiles: 1,
  },
  configSchema: schema,
  validationRules(field, value, isRequired) {
    const errors: string[] = []
    const files = Array.isArray(value) ? (value as FileMetadata[]) : []

    if (files.length === 0) {
      if (isRequired) errors.push('Please upload at least one file.')
      return errors
    }

    if (files.length > field.maxFiles) {
      errors.push(
        `Maximum ${field.maxFiles} file${field.maxFiles === 1 ? '' : 's'} allowed.`
      )
    }

    return errors
  },
  getSupportedOperators() {
    // File upload fields cannot be used as condition targets
    return []
  },
  pdfFormatter(field, value) {
    if (!Array.isArray(value) || value.length === 0) return '—'
    const files = value as FileMetadata[]
    return files.map((f) => f.name).join(', ')
  },
})
