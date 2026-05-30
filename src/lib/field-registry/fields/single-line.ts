import { z } from 'zod'
import type { SingleLineField } from '@/entities/field'
import { registerField } from '../registry'

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  placeholder: z.string().optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
})

registerField<SingleLineField>({
  type: 'single-line',
  label: 'Single Line Text',
  icon: 'Type',
  defaultConfig: {
    label: 'Text Field',
    placeholder: '',
  },
  configSchema: schema,
  validationRules(field, value, isRequired) {
    const errors: string[] = []
    if (isRequired && (value === null || value === '')) {
      errors.push('This field is required.')
      return errors
    }
    if (typeof value === 'string' && value.length > 0) {
      if (field.minLength !== undefined && value.length < field.minLength) {
        errors.push(`Minimum ${field.minLength} characters required.`)
      }
      if (field.maxLength !== undefined && value.length > field.maxLength) {
        errors.push(`Maximum ${field.maxLength} characters allowed.`)
      }
    }
    return errors
  },
  getSupportedOperators() {
    return ['equals', 'not-equals', 'contains']
  },
  pdfFormatter(_field, value) {
    if (value === null || value === undefined) return '—'
    return String(value)
  },
})
