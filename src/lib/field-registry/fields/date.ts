import { z } from 'zod'
import type { DateField } from '@/entities/field'
import { registerField } from '../registry'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  prefillToday: z.boolean(),
  minDate: z.string().regex(ISO_DATE_REGEX, 'Must be YYYY-MM-DD').optional(),
  maxDate: z.string().regex(ISO_DATE_REGEX, 'Must be YYYY-MM-DD').optional(),
})

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year!, month! - 1, day!)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

registerField<DateField>({
  type: 'date',
  label: 'Date',
  icon: 'Calendar',
  defaultConfig: {
    label: 'Date Field',
    prefillToday: false,
  },
  configSchema: schema,
  validationRules(field, value, isRequired) {
    const errors: string[] = []
    if (value === null || value === '') {
      if (isRequired) errors.push('This field is required.')
      return errors
    }
    if (typeof value !== 'string' || !ISO_DATE_REGEX.test(value)) {
      errors.push('Must be a valid date.')
      return errors
    }
    if (field.minDate && value < field.minDate) {
      errors.push(`Date cannot be before ${formatDisplayDate(field.minDate)}.`)
    }
    if (field.maxDate && value > field.maxDate) {
      errors.push(`Date cannot be after ${formatDisplayDate(field.maxDate)}.`)
    }
    return errors
  },
  getSupportedOperators() {
    return ['equals', 'is-before', 'is-after']
  },
  pdfFormatter(_field, value) {
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
      return formatDisplayDate(value)
    }
    return String(value)
  },
})
