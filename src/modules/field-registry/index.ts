/**
 * Field Registry Index
 *
 * Import this file once (e.g. in layout.tsx or StoreProvider.tsx) to execute
 * all field type registrations. Order of imports determines the palette display order.
 */

import './fields/single-line'
import './fields/multi-line'
import './fields/number'
import './fields/date'
import './fields/single-select'
import './fields/multi-select'
import './fields/file-upload'
import './fields/section-header'
import './fields/calculation'

export { registerField, getFieldEntry, getAllFieldEntries, hasFieldEntry } from './registry'
export type { FieldRegistryEntry } from './registry'
