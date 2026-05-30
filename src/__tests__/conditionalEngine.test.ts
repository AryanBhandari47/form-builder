import { describe, it, expect } from 'vitest'
import {
  evaluateAll,
  evaluateFieldRequired,
  buildDependencyGraph,
} from '@/lib/evaluator'
import type { FormField, SingleLineField, NumberField } from '@/entities/field'
import type { FieldValue } from '@/entities/response'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeTextField(
  id: string,
  overrides: Partial<SingleLineField> = {}
): SingleLineField {
  return {
    id,
    type: 'single-line',
    label: `Field ${id}`,
    order: 0,
    conditions: [],
    defaultVisibility: 'visible',
    defaultRequired: false,
    ...overrides,
  }
}

function makeNumberField(
  id: string,
  overrides: Partial<NumberField> = {}
): NumberField {
  return {
    id,
    type: 'number',
    label: `Number ${id}`,
    order: 0,
    conditions: [],
    defaultVisibility: 'visible',
    defaultRequired: false,
    decimalPlaces: 0,
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// evaluateAll tests
// ─────────────────────────────────────────────────────────────────────────────

describe('evaluateAll', () => {
  it('field with no conditions uses defaultVisibility=visible', () => {
    const field = makeTextField('f1', { defaultVisibility: 'visible' })
    const result = evaluateAll(['f1'], { f1: field }, {})
    expect(result.visibility['f1']).toBe(true)
  })

  it('field with no conditions uses defaultVisibility=hidden', () => {
    const field = makeTextField('f1', { defaultVisibility: 'hidden' })
    const result = evaluateAll(['f1'], { f1: field }, {})
    expect(result.visibility['f1']).toBe(false)
  })

  it('visible field is hidden when "hide" condition matches', () => {
    const trigger = makeTextField('trigger', { defaultVisibility: 'visible' })
    const target = makeTextField('target', {
      defaultVisibility: 'visible',
      conditions: [
        {
          targetFieldId: 'trigger',
          operator: 'equals',
          value: 'hide-me',
          effect: 'hide',
        },
      ],
    })
    const fields = { trigger, target }
    const values: Record<string, FieldValue> = { trigger: 'hide-me' }
    const result = evaluateAll(['trigger', 'target'], fields, values)
    expect(result.visibility['target']).toBe(false)
  })

  it('hidden field shown when "show" condition matches', () => {
    const trigger = makeTextField('trigger')
    const target = makeTextField('target', {
      defaultVisibility: 'hidden',
      conditions: [
        {
          targetFieldId: 'trigger',
          operator: 'equals',
          value: 'show-me',
          effect: 'show',
        },
      ],
    })
    const fields = { trigger, target }
    const values: Record<string, FieldValue> = { trigger: 'show-me' }
    const result = evaluateAll(['trigger', 'target'], fields, values)
    expect(result.visibility['target']).toBe(true)
  })

  it('condition does not trigger when value does not match', () => {
    const trigger = makeTextField('trigger')
    const target = makeTextField('target', {
      defaultVisibility: 'visible',
      conditions: [
        {
          targetFieldId: 'trigger',
          operator: 'equals',
          value: 'specific-value',
          effect: 'hide',
        },
      ],
    })
    const fields = { trigger, target }
    const values: Record<string, FieldValue> = { trigger: 'other-value' }
    const result = evaluateAll(['trigger', 'target'], fields, values)
    // Condition didn't pass, field stays visible (default)
    expect(result.visibility['target']).toBe(true)
  })

  it('AND logic: ALL conditions must pass — partial match keeps default', () => {
    const f1 = makeTextField('f1')
    const f2 = makeTextField('f2')
    const target = makeTextField('target', {
      defaultVisibility: 'visible',
      conditions: [
        { targetFieldId: 'f1', operator: 'equals', value: 'yes', effect: 'hide' },
        { targetFieldId: 'f2', operator: 'equals', value: 'yes', effect: 'hide' },
      ],
    })
    const fields = { f1, f2, target }
    // Only f1 matches — f2 doesn't → conditions don't all pass
    const values: Record<string, FieldValue> = { f1: 'yes', f2: 'no' }
    const result = evaluateAll(['f1', 'f2', 'target'], fields, values)
    expect(result.visibility['target']).toBe(true) // default visible unchanged
  })

  it('self-referencing condition is ignored', () => {
    const field = makeTextField('self', {
      defaultVisibility: 'visible',
      conditions: [
        {
          targetFieldId: 'self', // targets itself
          operator: 'equals',
          value: 'anything',
          effect: 'hide',
        },
      ],
    })
    const result = evaluateAll(['self'], { self: field }, { self: 'anything' })
    // Self-reference is skipped, so condition is treated as passing (skip = true)
    // But effect should not change from default (visible)
    // Since all conditions pass but effect is 'hide', field becomes hidden.
    // Actually by spec: self-referencing is treated as passing (returns true)
    // So all conditions pass → first effect 'hide' → hidden
    expect(result.visibility['self']).toBe(false)
  })

  it('"contains" operator matches substring (case-insensitive)', () => {
    const trigger = makeTextField('trigger')
    const target = makeTextField('target', {
      defaultVisibility: 'visible',
      conditions: [
        {
          targetFieldId: 'trigger',
          operator: 'contains',
          value: 'hello',
          effect: 'hide',
        },
      ],
    })
    const fields = { trigger, target }
    // Case-insensitive match
    const values: Record<string, FieldValue> = { trigger: 'Say Hello World' }
    const result = evaluateAll(['trigger', 'target'], fields, values)
    expect(result.visibility['target']).toBe(false)
  })

  it('"within-range" operator for numbers', () => {
    const trigger = makeNumberField('trigger')
    const target = makeTextField('target', {
      defaultVisibility: 'visible',
      conditions: [
        {
          targetFieldId: 'trigger',
          operator: 'within-range',
          value: ['10', '20'],
          effect: 'hide',
        },
      ],
    })
    const fields = { trigger, target }

    const inRange = evaluateAll(['trigger', 'target'], fields, { trigger: 15 })
    expect(inRange.visibility['target']).toBe(false)

    const outOfRange = evaluateAll(['trigger', 'target'], fields, { trigger: 5 })
    expect(outOfRange.visibility['target']).toBe(true)
  })

  it('hidden required field is NOT required in evaluation', () => {
    const trigger = makeTextField('trigger')
    const target = makeTextField('target', {
      defaultVisibility: 'visible',
      defaultRequired: true,
      conditions: [
        {
          targetFieldId: 'trigger',
          operator: 'equals',
          value: 'hide',
          effect: 'hide',
        },
      ],
    })
    const fields = { trigger, target }
    const values: Record<string, FieldValue> = { trigger: 'hide' }
    const result = evaluateAll(['trigger', 'target'], fields, values)
    expect(result.visibility['target']).toBe(false)
    expect(result.required['target']).toBe(false) // hidden → never required
  })

  it('section-header field is never required', () => {
    const field: FormField = {
      id: 'header1',
      type: 'section-header',
      label: 'Section',
      size: 'md',
      order: 0,
      conditions: [],
      defaultVisibility: 'visible',
      defaultRequired: true, // set to true but should be overridden
    }
    const result = evaluateAll(['header1'], { header1: field }, {})
    expect(result.required['header1']).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// buildDependencyGraph tests
// ─────────────────────────────────────────────────────────────────────────────

describe('buildDependencyGraph', () => {
  it('builds a graph where fieldB depends on fieldA', () => {
    const fieldA = makeTextField('a')
    const fieldB = makeTextField('b', {
      conditions: [{ targetFieldId: 'a', operator: 'equals', value: 'x', effect: 'show' }],
    })
    const graph = buildDependencyGraph({ a: fieldA, b: fieldB })
    expect(graph['a']).toBeDefined()
    expect(graph['a']?.has('b')).toBe(true)
  })

  it('excludes self-referencing conditions from graph', () => {
    const field = makeTextField('self', {
      conditions: [{ targetFieldId: 'self', operator: 'equals', value: 'x', effect: 'hide' }],
    })
    const graph = buildDependencyGraph({ self: field })
    // Self-reference should be skipped
    expect(graph['self']).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// evaluateFieldRequired tests
// ─────────────────────────────────────────────────────────────────────────────

describe('evaluateFieldRequired', () => {
  it('mark-required condition makes optional field required', () => {
    const trigger = makeTextField('trigger')
    const target = makeTextField('target', {
      defaultRequired: false,
      conditions: [
        { targetFieldId: 'trigger', operator: 'equals', value: 'yes', effect: 'mark-required' },
      ],
    })
    const fields = { trigger, target }
    const isVisible = true
    const result = evaluateFieldRequired(target, { trigger: 'yes' }, fields, isVisible)
    expect(result).toBe(true)
  })

  it('mark-not-required condition makes required field optional', () => {
    const trigger = makeTextField('trigger')
    const target = makeTextField('target', {
      defaultRequired: true,
      conditions: [
        { targetFieldId: 'trigger', operator: 'equals', value: 'skip', effect: 'mark-not-required' },
      ],
    })
    const fields = { trigger, target }
    const isVisible = true
    const result = evaluateFieldRequired(target, { trigger: 'skip' }, fields, isVisible)
    expect(result).toBe(false)
  })
})
