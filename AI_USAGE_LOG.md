# AI Usage Log

This document covers every significant AI interaction during development of FormCraft, including what was verified, what was rejected, and where AI output was incorrect.

---

## 0. Design Phase — Pencil.dev

**Tool**: [pencil.dev](https://pencil.dev) (AI-powered design tool with MCP integration)

Before writing any code, the entire UI was brainstormed and designed visually using pencil.dev:

- **Business logic brainstorming**: Mapped out the form builder's core workflows — template creation, field configuration, conditional logic, fill mode, and PDF export — as interactive design flows
- **Component architecture**: Designed the visual hierarchy of each screen (Templates dashboard, Builder, Fill form, Print view) with exact spacing, typography, and color tokens
- **Design-to-code pipeline**: Used pencil.dev's MCP server to export design tokens and component structures directly into the codebase, ensuring pixel-perfect implementation
- **Field type taxonomy**: Designed all 9 field types visually before implementing the discriminated union type system

This design-first approach meant the code implementation followed a precise visual specification rather than approximating from text descriptions. The CSS variables, Tailwind classes, and component APIs were all derived from the pencil.dev designs.

---

## 1. Foundation: Type System and Field Registry

**Prompt summary**: Asked Claude to design a discriminated union for 10 field types, a field registry pattern where registering an 11th field touches only one file, and a Redux store with normalized entity adapters.

**What was verified before using**:
- Confirmed the discriminated union covers all 10 field types and that TypeScript narrows correctly through the `type` discriminant
- Checked that the registry `Map<FieldType, FieldRegistryEntry>` is server-importable (no `'use client'`, no React imports)
- Verified the `FieldByType<T>` and `FieldConfig<T>` utility types compile correctly and the `InputFormField` excludes `section-header` and `calculation`

**What was changed**:
- The initial output put `BuilderRenderer` and `FillRenderer` inside `FieldRegistryEntry` as React components. This was rejected — React components in a server-importable registry create import chain issues in Next.js App Router. Renderers were moved to a separate UI-layer registration that only runs client-side.
- The entity adapter's `sortComparer` initially sorted by `createdAt` ascending. Changed to `updatedAt` descending to match the design (most-recently-modified templates appear first).

---

## 2. Conditional Engine — AND vs OR Decision

**Prompt summary**: Asked Claude to implement the conditional logic evaluator with pure functions, a dependency graph, and exhaustive operator support.

**What was verified**:
- Traced through the `evaluateAll()` flow manually with a 3-field example: field A visible, field B hidden if A equals "yes", field C required if B is visible
- Confirmed the hidden-required invariant: set field B as required + hidden → `evaluateFieldRequired` returns `false` because it checks `isVisible` first
- Verified the `within-range` operator correctly handles the `[min, max]` string array value format

**What was incorrect (plausible but wrong)**:
- The initial evaluator checked visibility and required conditions in the same loop. This produced incorrect results for fields with both a `hide` condition and a `mark-required` condition — the required evaluation ran before the visibility was finalized. The fix was to split the evaluation: compute all visibilities first in one pass, then compute required states using the finalized visibility map in a second pass. The current `evaluateAll()` implements this correctly.

**Verification approach**: wrote the 18 unit tests independently, then ran them against the engine. 3 tests failed on the first run (all related to the two-pass issue above), confirming the bug was real.

---

## 3. Builder Config Panel — Conditions Builder

**Prompt summary**: Asked Claude to build the ConditionsBuilder component with dynamic operator dropdowns filtered by target field type, and a value input that adapts to the operator.

**What was verified**:
- Tested the operator filtering logic manually: selecting a `single-select` target field should only show `equals` and `not-equals`, not `contains` or `within-range`
- Verified that `within-range` renders two number inputs (min/max) and stores the value as `[minStr, maxStr]` matching the `FieldCondition.value: string | string[]` type

**What was changed**:
- The initial output used a single `<input type="text">` for all value inputs. This was inadequate for `within-range` (needs two inputs) and `contains-any/all/none` (needs checkboxes of the target field's options). Replaced with a conditional render that switches on operator type.

---

## 4. Fill Mode — Calculation Field Update Timing

**Prompt summary**: Asked Claude to implement the FillForm orchestrator with real-time condition evaluation and calculation updates on every value change.

**What was verified**:
- Checked that calculation fields update immediately when a source number field changes
- Verified that hidden calculation fields do not contribute to their own aggregation
- Confirmed that the `computeAllCalculations` call passes the freshly-evaluated visibility map (not the stale one from Redux state) so hidden fields are correctly excluded

**What was incorrect**:
- The initial `handleFieldChange` implementation read `visibility` from `useSelector` inside the change handler — but React state updates are asynchronous, so the visibility used for calculation was one render behind. The fix was to compute the new visibility inline using `evaluateAll(template.fieldIds, template.fields, newValues)` and pass that result directly to `computeAllCalculations` rather than reading from the Redux snapshot.

---

## 5. Drag-and-Drop — Ghost Element vs Transform

**Prompt summary**: Asked Claude to implement a custom Pointer Events drag-to-reorder hook without external libraries.

**What was verified**:
- Confirmed that `requestAnimationFrame` throttling prevents layout thrashing during `pointermove`
- Verified the `elementFromPoint` hit-testing approach works correctly for finding the drop target

**What was changed/rejected**:
- The initial implementation created a "ghost element" (a cloned DOM node that follows the cursor). This was rejected because:
  1. Cloning DOM nodes with React-generated class names causes hydration conflicts
  2. Absolutely positioned ghost elements trigger a layout recalculation for every `pointermove`
  3. The simpler approach — CSS `opacity` on the source item + `outline` on the target — achieves the same UX signal with zero layout impact
- The final implementation uses `opacity: 0.4` on the dragged item and a `ring` outline on the current drop target. No DOM cloning.

---

## 6. Codebase Refactoring — Senior Architect Review

**Prompt summary**: Asked Claude to review the codebase as a senior frontend architect at Google and enforce Next.js/React best practices.

**Changes made**:

### Server/Client Component Split
- Extracted client wrappers from all 4 `page.tsx` files (`templates`, `templates/[templateId]`, `fill/[templateId]/[responseId]`, `print/[responseId]`)
- Each `page.tsx` is now a Server Component that renders a `*PageClient.tsx` client component
- Pattern: `page.tsx` (zero logic) → `*PageClient.tsx` (all hooks, state, Redux)

### One Component Per File
- Split `shared/ui/Skeleton.tsx` (3 exports) → `Skeleton.tsx`, `SkeletonCard.tsx`, `SkeletonRow.tsx`
- Split `config/ConfigRow.tsx` (4 exports) → `ConfigRow.tsx`, `ConfigInput.tsx`, `ConfigSection.tsx`, `ConfigDivider.tsx`
- Extracted `StatCard` from `ResponsesPanel.tsx` → `StatCard.tsx`
- Updated 9 files that imported from `ConfigRow` to use individual imports

### Shared Icons
- Created `shared/ui/Icons.tsx` with `ChevronUpIcon`, `ChevronDownIcon`, `XIcon`
- Removed identical copy-pasted definitions from `SingleSelectConfig.tsx`, `MultiSelectConfig.tsx`, `BuilderCanvas.tsx`

### Helper Function Extraction
- Moved `formatFileSize` (from `FileUploadFillField.tsx`) → `lib/utils.ts`
- Moved `getFirstTextValue`, `getCompletionPercentage` (from `ResponsesPanel.tsx`) → `lib/utils.ts`
- Removed dead code: `countAnswerableFields()` stub in `FillForm.tsx` (never called)

### React 19 Activity API
- Applied `<Activity>` to builder page tabs (Build/Preview/Responses)
- Tabs now preserve state when switching: form scroll position, field selection, and partial inputs persist
- Previously, switching tabs unmounted the previous tab's component tree

### Hydration Fix
- Fixed race condition in `FillForm.tsx` where `existingResponse` was `null` during first render on page reload
- Added guard: `if (isViewingExisting && !existingResponse) return;` to skip initialization until response is loaded from localStorage

### CSS Cleanup
- Removed global `a { color: var(--color-primary); }` rule that was overriding Tailwind `text-white` on Link components
- Added `box-shadow: none` to input focus rule to suppress Tailwind ring utilities
- Added `suppressHydrationWarning` to `<body>` to tolerate browser extension mutations (Grammarly)

**What was verified**:
- Full build passes after all changes
- No TypeScript errors
- All imports updated correctly across codebase
