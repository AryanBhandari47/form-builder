import { z } from 'zod'
import type { MultiSelectField, SelectOption } from '../../../entities/field'
import type { FieldValue } from '../../../entities/response'
import { registerField } from '../registry'

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  options: z
    .array(z.object({ id: z.string(), label: z.string() }))
    .min(1, 'At least one option is required'),
  minSelections: z.number().int().nonnegative().optional(),
  maxSelections: z.number().int().positive().optional(),
})

registerField<MultiSelectField>({
  type: 'multi-select',
  label: 'Multi Select',
  icon: 'CheckSquare',
  defaultConfig: {
    label: 'Select All That Apply',
    options: [
      { id: 'opt-1', label: 'Option 1' },
      { id: 'opt-2', label: 'Option 2' },
      { id: 'opt-3', label: 'Option 3' },
    ],
  },
  configSchema: schema,
  validationRules(field, value, isRequired) {
    const errors: string[] = []
    const selected = Array.isArray(value) ? (value as string[]) : []

    if (selected.length === 0) {
      if (isRequired) errors.push('Please select at least one option.')
      return errors
    }

    const validIds = new Set(field.options.map((o: SelectOption) => o.id))
    const invalidSelections = selected.filter((s) => !validIds.has(s))
    if (invalidSelections.length > 0) {
      errors.push('One or more selected options are not valid.')
    }

    if (field.minSelections !== undefined && selected.length < field.minSelections) {
      errors.push(`Please select at least ${field.minSelections} options.`)
    }
    if (field.maxSelections !== undefined && selected.length > field.maxSelections) {
      errors.push(`Please select no more than ${field.maxSelections} options.`)
    }

    return errors
  },
  getSupportedOperators() {
    return ['contains-any', 'contains-all', 'contains-none']
  },
  pdfFormatter(field, value) {
    if (!Array.isArray(value) || value.length === 0) return '—'
    const selected = value as string[]
    return selected
      .map((id) => field.options.find((o: SelectOption) => o.id === id)?.label ?? id)
      .join(', ')
  },
})
