import { z } from 'zod'
import type { CalculationField } from '@/entities/field'
import { registerField } from '../registry'

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  sourceFieldIds: z.array(z.string()).min(1, 'At least one source field is required'),
  aggregation: z.enum(['sum', 'avg', 'min', 'max']),
  decimalPlaces: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
})

registerField<CalculationField>({
  type: 'calculation',
  label: 'Calculation',
  icon: 'Calculator',
  defaultConfig: {
    label: 'Calculated Value',
    sourceFieldIds: [],
    aggregation: 'sum',
    decimalPlaces: 2,
  },
  configSchema: schema,
  validationRules(_field, _value, _isRequired) {
    // Calculation fields are read-only — no user input to validate
    return []
  },
  getSupportedOperators() {
    // Calculation fields cannot be used as condition targets
    return []
  },
  pdfFormatter(field, value) {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'number') {
      return value.toFixed(field.decimalPlaces)
    }
    return String(value)
  },
})
