import { z } from 'zod'
import type { SectionHeaderField } from '../../../entities/field'
import type { FieldValue } from '../../../entities/response'
import { registerField } from '../registry'

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
})

registerField<SectionHeaderField>({
  type: 'section-header',
  label: 'Section Header',
  icon: 'Heading',
  defaultConfig: {
    label: 'Section Title',
    size: 'md',
  },
  configSchema: schema,
  validationRules(_field, _value, _isRequired) {
    // Section headers never capture user input
    return []
  },
  getSupportedOperators() {
    // Section headers cannot be used as condition targets
    return []
  },
  pdfFormatter(_field, _value) {
    // Section headers are rendered as headings in PDF, not as values
    return ''
  },
})
