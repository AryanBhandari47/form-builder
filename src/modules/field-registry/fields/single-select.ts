import { z } from 'zod'
import type { SingleSelectField, SelectOption } from '../../../entities/field'
import type { FieldValue } from '../../../entities/response'
import { registerField } from '../registry'

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  options: z
    .array(z.object({ id: z.string(), label: z.string() }))
    .min(1, 'At least one option is required'),
  displayType: z.enum(['radio', 'dropdown', 'tiles']),
})

registerField<SingleSelectField>({
  type: 'single-select',
  label: 'Single Select',
  icon: 'CircleDot',
  defaultConfig: {
    label: 'Select One',
    options: [
      { id: 'opt-1', label: 'Option 1' },
      { id: 'opt-2', label: 'Option 2' },
    ],
    displayType: 'radio',
  },
  configSchema: schema,
  validationRules(field, value, isRequired) {
    const errors: string[] = []
    // single-select values are either a string[] (selected option id) or null
    const rawId = Array.isArray(value)
      ? (value[0] as unknown)
      : (value as unknown)
    const strValue = typeof rawId === 'string' ? rawId : null
    if (!strValue) {
      if (isRequired) errors.push('Please select an option.')
      return errors
    }
    const validIds = field.options.map((o: SelectOption) => o.id)
    if (!validIds.includes(strValue)) {
      errors.push('Selected option is not valid.')
    }
    return errors
  },
  getSupportedOperators() {
    return ['equals', 'not-equals']
  },
  pdfFormatter(field, value) {
    if (value === null || value === undefined) return '—'
    const id = Array.isArray(value) ? value[0] : String(value)
    const option = field.options.find((o: SelectOption) => o.id === id)
    return option?.label ?? String(id)
  },
})
