# FormCraft — Production-Grade Form Builder

A browser-based form builder with the visual quality of a modern SaaS product. Engineered for extensibility, runtime performance, and clean architecture.

## Quick Start

```bash
npm install
npm run dev        # development server → http://localhost:3000
npm run build      # production build
npm run test       # unit tests (vitest)
npm run test:watch # watch mode
```

---

## Architecture Decisions

### 1. Field Registry Pattern

Every field type self-registers into a global `Map<FieldType, FieldRegistryEntry>`:

```typescript
interface FieldRegistryEntry<T extends FormField> {
  type:                 T['type']
  label:                string
  icon:                 string
  defaultConfig:        Omit<T, 'id' | 'type' | 'order' | 'conditions' | ...>
  configSchema:         ZodSchema
  validationRules:      (field: T, value: FieldValue, isRequired: boolean) => string[]
  getSupportedOperators:() => ConditionalOperator[]
  pdfFormatter:         (field: T, value: FieldValue) => string
}
```

**Adding an 11th field type requires touching exactly one file**: create `src/lib/field-registry/fields/my-new-type.ts` and add one import to `src/lib/field-registry/index.ts`. No switch statements in existing files. No conditional rendering in shared components. The UI palette, config panel, fill renderers, and PDF exporter all resolve behaviour through the registry.

The registry is server-importable (no React imports) — safe to use in server components, edge functions, or API routes.

### 2. Type System — Discriminated Unions

```typescript
type FormField =
  | SingleLineField // type: 'single-line'
  | MultiLineField // type: 'multi-line'
  | NumberField // type: 'number'
  | DateField // type: 'date'
  | SingleSelectField // type: 'single-select'  (radio | dropdown | tiles)
  | MultiSelectField // type: 'multi-select'
  | FileUploadField // type: 'file-upload'
  | SectionHeaderField // type: 'section-header'
  | CalculationField; // type: 'calculation'
```

TypeScript narrows the union through the discriminant, giving full type safety in field-type-specific code without casting. Utility types `FieldByType<T>`, `FieldConfig<T>`, and `InputFormField` are derived from the union.

### 3. Normalized Redux State

Templates use `createEntityAdapter` for normalized storage:

```
state.templates = {
  ids: ['abc', 'def'],
  entities: {
    'abc': {
      id, title, fieldIds: ['f1', 'f2'],
      fields: { f1: SingleLineField, f2: NumberField }
    }
  }
}
```

Fields are embedded inside their template (not a flat global fields slice) because:

- Fields are never queried across templates
- Reduces selector composition depth
- Avoids cascade invalidation on template delete

The `fieldIds: string[]` ordered array is separated from the `fields: Record<string, FormField>` map so reordering is O(n) array manipulation without touching field objects.

### 4. Conditional Logic Engine

Located in `src/lib/evaluator.ts` — pure functions, zero React dependencies.

**AND Logic**: Multiple conditions on a single field use AND semantics — all conditions must be true for the effect to apply.

Rationale: AND is the correct default for "show this field when the user has confirmed they're in category X and their region is Y". OR requires an explicit "any of these" mental model (Typeform surfaces this via grouping UI). AND is simpler to implement correctly and easier for builders to reason about.

**Evaluation strategy**: `evaluateAll()` runs on every value change — O(fields × conditions). Acceptable for forms up to ~200 fields. `buildDependencyGraph()` is available for incremental evaluation when needed: the graph maps `fieldId → Set<dependentFieldIds>` so only affected dependency chains are re-evaluated.

### 5. Calculation Engine

Located in `src/lib/calculator.ts` — pure functions.

Supports: Sum, Average, Minimum, Maximum over a selected set of Number fields.

Rules:

- Calculation fields may not source other calculation fields (prevents circular dependencies)
- Only visible source fields contribute to the result
- Results are rounded to `field.decimalPlaces` using standard rounding
- Returns `null` when no valid source values exist (field shows "—")

### 6. Storage Architecture

The storage layer is abstracted behind a `StorageAdapter` interface with 8 async methods. The concrete `LocalStorageAdapter` can be swapped for IndexedDB, a remote API, or a sync engine without modifying any consumer.

**Why adapter pattern for localStorage?** The assignment requires localStorage but a production tool would need IndexedDB (larger payloads, async, structured queries) or a remote API. Designing for this from the start means the migration is a one-file change.

### 7. Drag-and-Drop

Custom implementation using the Pointer Events API — no external library.

**Reorder (canvas fields):**

- Drag start captures the card's `DOMRect` and renders a fixed-position full-card clone that follows the cursor imperatively via `cloneRef` (no React state on every `pointermove` — direct DOM mutation)
- The dragged card becomes `visibility: hidden` in-place, preserving its layout space
- All other cards animate with `transform: translateY()` (150ms ease) to open/close a gap at the insertion point — GPU-composited, no reflow
- Drop position is calculated by comparing cursor Y against each card's midpoint; the gap itself is the visual indicator — no inserted DOM element
- `requestAnimationFrame` throttles the insert-index recalculation

**Add from palette:**

- Dragging a field type from the left panel shows a floating mini ghost chip (label + icon) following the cursor
- A full-width dimmed placeholder card is injected directly into the flex column at the computed insertion point, physically pushing other cards aside
- On drop, the placeholder disappears and the real field appears in its place, selected

**Shared state**: `BuilderDragContext` is a React context shared between `FieldPalette` and `BuilderCanvas` — the palette initiates `mode: 'add'` drags; the canvas initiates `mode: 'reorder'` drags. Ghost position is updated via context; card displacement is computed locally in the hook.

- Keyboard fallback: ArrowUp/ArrowDown on focused field cards still works
- Drag state refs (`draggingIdRef`, `fromIndexRef`, `cloneElRef`) avoid closure staleness and prevent pointermove from triggering rerenders

### 8. PDF Export

Uses `window.print()` on a dedicated `/print/[responseId]` route with print-specific CSS. No third-party PDF library.

The print route has no nav, no sidebar, no interactive UI. The browser's print dialog renders exactly what's on screen. Print CSS hides `.no-print` elements and expands content to full width. Hidden fields (due to conditional logic) are excluded via the `visibilityMap` stored on `FormResponse` at submission time.

### 9. Fill Mode Performance

`FillFieldRenderer` is `React.memo`'d with granular per-field selectors:

```typescript
const value = useSelector(
  (state: RootState) => state.fill.values[fieldId] ?? null
);
const required = useSelector(
  (state: RootState) => state.fill.required[fieldId] ?? false
);
```

Each field only rerenders when its own value, errors, visibility, or required state changes — not when any other field in the form changes.

### 10. Server/Client Component Split

All `page.tsx` files are **Server Components** — they import and render client wrapper components:

```
page.tsx (Server) → *PageClient.tsx (Client)
```

This keeps the server/client boundary at the page level. Client components that need hooks, Redux, or browser APIs live in separate `*Client.tsx` files co-located with their page.

---

## localStorage Schema

| Key                         | Value               | Notes                                   |
| --------------------------- | ------------------- | --------------------------------------- |
| `fb:templates`              | `string[]`          | Ordered array of template IDs (index)   |
| `fb:template:{id}`          | `FormTemplate` JSON | Full template including embedded fields |
| `fb:responses:{templateId}` | `string[]`          | Ordered array of response IDs           |
| `fb:response:{id}`          | `FormResponse` JSON | Full response + template snapshot       |

**Separate index keys from data keys**: Reading the template list (`fb:templates`) is cheap — it's just IDs. Full template data is loaded individually only when the builder opens a template.

**Fields embedded in template**: Fields are never queried independently across templates. Embedding avoids a join-on-read and simplifies atomic writes (one `localStorage.setItem` per save).

**Template snapshot on response**: `FormResponse.templateSnapshot` stores a copy of field definitions at submission time. PDF exports remain accurate even after the template is edited or deleted later.

---

## IndexedDB Migration Path

The `StorageAdapter` interface is the seam:

1. Create `src/lib/storage/indexedDb.adapter.ts` implementing `StorageAdapter` (using `idb`)
2. Replace the singleton import in consuming files from `localStorage.adapter` → `indexedDb.adapter`
3. Add a one-time migration in `StorageHydration.tsx`: on first run, copy `fb:*` localStorage entries into IDB, then clear localStorage

No other files change. Redux store, selectors, and all components are adapter-agnostic.

---

## Testing Strategy

Unit tests cover the two stateful engines — pure functions, deterministic, fast:

```
src/__tests__/conditionalEngine.test.ts    18 tests
src/__tests__/calculationEngine.test.ts    10 tests
```

**Why pure functions**: Engines are the most logic-dense parts. Testing them as pure functions (input → output, no mocks) is more valuable than component tests and runs in milliseconds.

**What's intentionally not unit tested**:

- React components — covered by E2E in production
- Storage adapter — localStorage I/O is an integration concern, not a unit
- Redux reducers — RTK reducers are thin Immer wrappers; the business logic lives in the engines

---

## Project Structure

```
src/
├── app/                               # Next.js App Router (Server Components only)
│   ├── templates/
│   │   ├── page.tsx                   # Templates dashboard
│   │   └── [templateId]/
│   │       └── page.tsx               # Builder page
│   ├── fill/[templateId]/[responseId]/
│   │   ├── page.tsx                   # Fill form page
│   │   └── error.tsx                  # Error boundary
│   ├── print/[responseId]/
│   │   └── page.tsx                   # Print/PDF page
│   ├── layout.tsx                     # Root layout (Server)
│   └── page.tsx                       # Redirect to /templates
│
├── components/                        # Client components (one component per file)
│   ├── builder/                       # Builder canvas, palette, config panel, drag UI
│   │   ├── BuilderCanvas.tsx          # Canvas with DnD reorder + palette-drop
│   │   ├── BuilderFieldCard.tsx       # Draggable field card
│   │   ├── AddGhostCard.tsx           # Placeholder card during palette drag
│   │   ├── DragGhost.tsx              # Floating chip following cursor (palette add)
│   │   ├── FieldPalette.tsx           # Left panel field type picker
│   │   ├── ConfigPanel.tsx            # Right panel field config editor
│   │   ├── FieldConfigForm.tsx        # Dispatches to per-type config form
│   │   ├── FieldIcon.tsx              # Field type → icon mapper
│   │   └── FieldPreview.tsx           # Field type → preview renderer
│   ├── conditions/                    # Conditional logic builder
│   │   ├── ConditionsBuilder.tsx
│   │   ├── ConditionRow.tsx
│   │   └── ConditionValueInput.tsx
│   ├── fill-form/                     # Form fill orchestration
│   │   ├── FillForm.tsx               # Form orchestrator + submit logic
│   │   └── FillFieldRenderer.tsx      # Per-field Redux-granular renderer
│   ├── responses/                     # Responses panel
│   │   ├── ResponsesPanel.tsx
│   │   └── StatCard.tsx
│   ├── config/                        # Per-type field config forms (11 files)
│   ├── fill-fields/                   # Per-type fill renderers (9 files)
│   ├── fill/                          # Fill page client + logo icon
│   │   ├── FillPageClient.tsx
│   │   └── LogoIcon.tsx
│   ├── print/                         # Print page client + field row
│   │   ├── PrintPageClient.tsx
│   │   └── PrintFieldRow.tsx
│   ├── templates/                     # Templates & builder page clients
│   │   ├── TemplatesPageClient.tsx
│   │   ├── BuilderPageClient.tsx
│   │   ├── NavLink.tsx, ScratchCard.tsx
│   │   ├── TabButton.tsx, EditableTitle.tsx, MobileDrawer.tsx
│   ├── TemplateCard.tsx               # Template list card
│   └── StorageHydration.tsx           # localStorage → Redux sync
│
├── contexts/                          # React contexts
│   └── BuilderDragContext.tsx         # Shared drag state between palette and canvas
│
├── hooks/                             # Custom React hooks
│   ├── useDragToReorder.ts            # Pointer Events drag-to-reorder (reorder mode)
│   └── useStorageHydration.ts         # localStorage hydration hook
│
├── entities/                          # Domain types (no React, no Redux)
│   ├── field.ts                       # FormField discriminated union (9 types)
│   ├── template.ts                    # FormTemplate
│   └── response.ts                    # FormResponse, FieldValue, FileMetadata
│
├── lib/                               # Pure logic, no React dependencies
│   ├── calculator.ts                  # Calculation engine (sum, avg, min, max)
│   ├── evaluator.ts                   # Conditional logic engine
│   ├── field-registry/                # Registry API + self-registration per type
│   │   ├── index.ts, registry.ts
│   │   └── fields/                    # Registration files (9 files)
│   ├── storage/                       # Storage adapter layer
│   │   ├── adapter.ts                 # StorageAdapter interface
│   │   ├── localStorage.adapter.ts    # LocalStorageAdapter implementation
│   │   └── seedData.ts               # Default template seeding
│   └── utils.ts                       # cn(), generateId(), formatDate(), etc.
│
├── shared/ui/                         # Design-system components (one per file)
│   ├── index.ts                       # Barrel exports
│   ├── Button.tsx, Input.tsx, Textarea.tsx, Select.tsx
│   ├── Toggle.tsx, Badge.tsx, Spinner.tsx
│   ├── EmptyState.tsx, Tooltip.tsx
│   ├── Skeleton.tsx, SkeletonCard.tsx, SkeletonRow.tsx
│   └── Icons.tsx                      # Shared icons (23 icon components)
│
├── store/                             # Redux Toolkit
│   ├── slices/                        # templates, responses, builderUi, fill, app
│   ├── selectors/                     # Memoized Reselect selectors
│   ├── StoreProvider.tsx              # 'use client' Redux Provider
│   └── index.ts                       # makeStore(), RootState, AppDispatch
│
└── __tests__/                         # Engine unit tests
    ├── conditionalEngine.test.ts      # 18 tests
    └── calculationEngine.test.ts      # 10 tests
```
