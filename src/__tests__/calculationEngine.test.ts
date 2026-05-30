import { describe, it, expect } from 'vitest'
import { computeCalculation, computeAllCalculations } from '@/lib/calculator'
import type {
  CalculationField,
  NumberField,
  FormField,
} from '@/entities/field'
import type { FieldValue } from '@/entities/response'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeNumberField(id: string, overrides: Partial<NumberField> = {}): NumberField {
  return {
    id,
    type: 'number',
    label: `Number ${id}`,
    order: 0,
    conditions: [],
    defaultVisibility: 'visible',
    defaultRequired: false,
    decimalPlaces: 2,
    ...overrides,
  }
}

function makeCalcField(
  id: string,
  sourceFieldIds: string[],
  overrides: Partial<CalculationField> = {}
): CalculationField {
  return {
    id,
    type: 'calculation',
    label: `Calc ${id}`,
    sourceFieldIds,
    aggregation: 'sum',
    decimalPlaces: 2,
    order: 99,
    conditions: [],
    defaultVisibility: 'visible',
    defaultRequired: false,
    ...overrides,
  }
}

// All fields visible by default
function allVisible(ids: string[]): Record<string, boolean> {
  return Object.fromEntries(ids.map((id) => [id, true]))
}

// ─────────────────────────────────────────────────────────────────────────────
// computeCalculation tests
// ─────────────────────────────────────────────────────────────────────────────

describe('computeCalculation', () => {
  it('sum of two number fields', () => {
    const n1 = makeNumberField('n1')
    const n2 = makeNumberField('n2')
    const calc = makeCalcField('c1', ['n1', 'n2'], { aggregation: 'sum', decimalPlaces: 2 })
    const fields: Record<string, FormField> = { n1, n2, c1: calc }
    const values: Record<string, FieldValue> = { n1: 10, n2: 25 }
    const visibility = allVisible(['n1', 'n2', 'c1'])

    expect(computeCalculation(calc, values, fields, visibility)).toBe(35)
  })

  it('average of three fields', () => {
    const n1 = makeNumberField('n1')
    const n2 = makeNumberField('n2')
    const n3 = makeNumberField('n3')
    const calc = makeCalcField('c1', ['n1', 'n2', 'n3'], { aggregation: 'avg', decimalPlaces: 2 })
    const fields: Record<string, FormField> = { n1, n2, n3, c1: calc }
    const values: Record<string, FieldValue> = { n1: 10, n2: 20, n3: 30 }
    const visibility = allVisible(['n1', 'n2', 'n3', 'c1'])

    expect(computeCalculation(calc, values, fields, visibility)).toBe(20)
  })

  it('min of values', () => {
    const n1 = makeNumberField('n1')
    const n2 = makeNumberField('n2')
    const n3 = makeNumberField('n3')
    const calc = makeCalcField('c1', ['n1', 'n2', 'n3'], { aggregation: 'min', decimalPlaces: 0 })
    const fields: Record<string, FormField> = { n1, n2, n3, c1: calc }
    const values: Record<string, FieldValue> = { n1: 5, n2: 3, n3: 8 }
    const visibility = allVisible(['n1', 'n2', 'n3', 'c1'])

    expect(computeCalculation(calc, values, fields, visibility)).toBe(3)
  })

  it('max of values', () => {
    const n1 = makeNumberField('n1')
    const n2 = makeNumberField('n2')
    const calc = makeCalcField('c1', ['n1', 'n2'], { aggregation: 'max', decimalPlaces: 0 })
    const fields: Record<string, FormField> = { n1, n2, c1: calc }
    const values: Record<string, FieldValue> = { n1: 100, n2: 42 }
    const visibility = allVisible(['n1', 'n2', 'c1'])

    expect(computeCalculation(calc, values, fields, visibility)).toBe(100)
  })

  it('returns null when no valid source values', () => {
    const n1 = makeNumberField('n1')
    const calc = makeCalcField('c1', ['n1'], { aggregation: 'sum' })
    const fields: Record<string, FormField> = { n1, c1: calc }
    const values: Record<string, FieldValue> = { n1: null }
    const visibility = allVisible(['n1', 'c1'])

    expect(computeCalculation(calc, values, fields, visibility)).toBeNull()
  })

  it('returns null when all source values are missing', () => {
    const n1 = makeNumberField('n1')
    const calc = makeCalcField('c1', ['n1'])
    const fields: Record<string, FormField> = { n1, c1: calc }
    const values: Record<string, FieldValue> = {}
    const visibility = allVisible(['n1', 'c1'])

    expect(computeCalculation(calc, values, fields, visibility)).toBeNull()
  })

  it('ignores hidden source fields', () => {
    const n1 = makeNumberField('n1')
    const n2 = makeNumberField('n2')
    const calc = makeCalcField('c1', ['n1', 'n2'], { aggregation: 'sum', decimalPlaces: 0 })
    const fields: Record<string, FormField> = { n1, n2, c1: calc }
    const values: Record<string, FieldValue> = { n1: 10, n2: 20 }
    const visibility: Record<string, boolean> = { n1: true, n2: false, c1: true }

    // n2 is hidden, so only n1 (10) should be summed
    expect(computeCalculation(calc, values, fields, visibility)).toBe(10)
  })

  it('ignores calculation-type source fields', () => {
    const n1 = makeNumberField('n1')
    const otherCalc = makeCalcField('other-calc', ['n1'], { aggregation: 'sum' })
    const calc = makeCalcField('c1', ['n1', 'other-calc'], { aggregation: 'sum', decimalPlaces: 0 })
    const fields: Record<string, FormField> = { n1, 'other-calc': otherCalc, c1: calc }
    const values: Record<string, FieldValue> = { n1: 10, 'other-calc': 50 }
    const visibility = allVisible(['n1', 'other-calc', 'c1'])

    // 'other-calc' is type=calculation → should be ignored
    expect(computeCalculation(calc, values, fields, visibility)).toBe(10)
  })

  it('rounds to correct decimal places', () => {
    const n1 = makeNumberField('n1')
    const n2 = makeNumberField('n2')
    const calc = makeCalcField('c1', ['n1', 'n2'], { aggregation: 'avg', decimalPlaces: 2 })
    const fields: Record<string, FormField> = { n1, n2, c1: calc }
    const values: Record<string, FieldValue> = { n1: 10, n2: 3 }
    const visibility = allVisible(['n1', 'n2', 'c1'])

    // avg(10, 3) = 6.5 → rounded to 2 decimal places = 6.5
    const result = computeCalculation(calc, values, fields, visibility)
    expect(result).toBe(6.5)
  })

  it('rounds to 0 decimal places correctly', () => {
    const n1 = makeNumberField('n1')
    const n2 = makeNumberField('n2')
    const calc = makeCalcField('c1', ['n1', 'n2'], { aggregation: 'avg', decimalPlaces: 0 })
    const fields: Record<string, FormField> = { n1, n2, c1: calc }
    const values: Record<string, FieldValue> = { n1: 10, n2: 3 }
    const visibility = allVisible(['n1', 'n2', 'c1'])

    // avg(10, 3) = 6.5 → rounded to 0 decimals = 7
    const result = computeCalculation(calc, values, fields, visibility)
    expect(result).toBe(7)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// computeAllCalculations tests
// ─────────────────────────────────────────────────────────────────────────────

describe('computeAllCalculations', () => {
  it('computes all calculation fields in the form', () => {
    const n1 = makeNumberField('n1')
    const n2 = makeNumberField('n2')
    const sum = makeCalcField('sum', ['n1', 'n2'], { aggregation: 'sum', decimalPlaces: 0 })
    const max = makeCalcField('max', ['n1', 'n2'], { aggregation: 'max', decimalPlaces: 0 })
    const fields: Record<string, FormField> = { n1, n2, sum, max }
    const fieldIds = ['n1', 'n2', 'sum', 'max']
    const values: Record<string, FieldValue> = { n1: 10, n2: 30 }
    const visibility = allVisible(fieldIds)

    const result = computeAllCalculations(fieldIds, fields, values, visibility)
    expect(result['sum']).toBe(40)
    expect(result['max']).toBe(30)
    expect('n1' in result).toBe(false)
    expect('n2' in result).toBe(false)
  })

  it('skips hidden calculation fields', () => {
    const n1 = makeNumberField('n1')
    const calc = makeCalcField('calc', ['n1'], { aggregation: 'sum', decimalPlaces: 0 })
    const fields: Record<string, FormField> = { n1, calc }
    const fieldIds = ['n1', 'calc']
    const values: Record<string, FieldValue> = { n1: 99 }
    const visibility: Record<string, boolean> = { n1: true, calc: false }

    const result = computeAllCalculations(fieldIds, fields, values, visibility)
    expect('calc' in result).toBe(false)
  })

  it('returns null for calc with no source values', () => {
    const n1 = makeNumberField('n1')
    const calc = makeCalcField('calc', ['n1'], { aggregation: 'sum', decimalPlaces: 0 })
    const fields: Record<string, FormField> = { n1, calc }
    const fieldIds = ['n1', 'calc']
    const values: Record<string, FieldValue> = { n1: null }
    const visibility = allVisible(fieldIds)

    const result = computeAllCalculations(fieldIds, fields, values, visibility)
    expect(result['calc']).toBeNull()
  })
})
