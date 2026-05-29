import { z } from 'zod'
import type { NumberField } from '../../../entities/field'
import type { FieldValue } from '../../../entities/response'
import { registerField } from '../registry'

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  min: z.number().optional(),
  max: z.number().optional(),
  decimalPlaces: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
})

registerField<NumberField>({
  type: 'number',
  label: 'Number',
  icon: 'Hash',
  defaultConfig: {
    label: 'Number Field',
    decimalPlaces: 0,
  },
  configSchema: schema,
  validationRules(field, value, isRequired) {
    const errors: string[] = []
    if (value === null || value === undefined) {
      if (isRequired) errors.push('This field is required.')
      return errors
    }
    if (typeof value !== 'number') {
      errors.push('Must be a valid number.')
      return errors
    }
    if (!isFinite(value)) {
      errors.push('Must be a finite number.')
      return errors
    }
    if (field.min !== undefined && value < field.min) {
      errors.push(`Minimum value is ${field.min}.`)
    }
    if (field.max !== undefined && value > field.max) {
      errors.push(`Maximum value is ${field.max}.`)
    }
    return errors
  },
  getSupportedOperators() {
    return ['equals', 'greater-than', 'less-than', 'within-range']
  },
  pdfFormatter(field, value) {
    if (value === null || value === undefined) return '—'
    if (typeof value !== 'number') return String(value)
    const formatted = value.toFixed(field.decimalPlaces)
    const prefix = field.prefix ?? ''
    const suffix = field.suffix ?? ''
    return `${prefix}${formatted}${suffix}`
  },
})
