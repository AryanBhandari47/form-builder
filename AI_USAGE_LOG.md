# AI Usage Log

Significant AI interactions during development, covering what was verified, rejected, and where AI output was incorrect.

---

## 0. Brainstorming & Design (Pencil.dev)

**Tool**: pencil.dev (AI-powered design tool with MCP integration)

Before coding, the entire UI was designed visually as interactive flows — template CRUD, field configuration, conditional logic, fill mode, and PDF export. The MCP server exported design tokens (colors, spacing, typography) directly into CSS variables and Tailwind config. This ensured pixel-accurate implementation from the start.

---

## 1. Type System & Field Registry

**Prompt**: Design a discriminated union for 10 field types, a field registry pattern where adding an 11th field type touches only one file, and a normalized Redux store.

**Verified**: Discriminated union covers all field types and narrows correctly through `type`. Registry is server-importable (no `'use client'`). `InputFormField` correctly excludes `section-header` and `calculation`.

**Rejected**: AI put `BuilderRenderer` and `FillRenderer` inside the registry entry as React components. This breaks Next.js import chains — the registry is imported by server components. Renderers were moved to a separate client-only registration layer.

---

## 2. Conditional Logic Engine

**Prompt**: Implement the evaluator as pure functions with a dependency graph, supporting all operators per field type, AND logic, and hidden-required invariants.

**Verified**: Traced `evaluateAll()` manually with a 3-field chain (A → B → C). Confirmed hidden-required invariant: a hidden field with `defaultRequired: true` evaluates to `false`. Verified `within-range` handles `[min, max]` correctly.

**Incorrect (plausible but wrong)**: The initial evaluator checked visibility and required conditions in a single loop. For a field with both `hide` and `mark-required` conditions, required ran before visibility was finalized — incorrectly requiring a hidden field. Fix: two-pass evaluation — compute all visibilities first, then required states using the finalized visibility map. 3 of 18 unit tests caught this.

---

## 3. Conditions Builder UI

**Prompt**: Build a conditions builder with dynamic operator dropdowns filtered by target field type, and a value input that adapts to the operator.

**Verified**: Selecting a `single-select` target field only shows `equals` and `not-equals`. `within-range` renders two number inputs and stores `[minStr, maxStr]` matching the `string | string[]` union type.

**Rejected**: AI used a single `<input type="text">` for all value inputs. Replaced with a conditional render that switches on operator — two inputs for ranges, checkboxes for multi-select, date picker for date fields, select for single-select options.

---

## 4. Fill Mode — Calculation Timing

**Prompt**: Implement the FillForm orchestrator with real-time condition evaluation and calculation updates on every value change.

**Verified**: Calculations update when source fields change. Hidden calculation fields don't contribute to aggregation. `computeAllCalculations` receives the freshly-evaluated visibility map.

**Incorrect**: AI's `handleFieldChange` read `visibility` from `useSelector` inside the change handler — but React state updates are asynchronous, so visibility was one render behind. Fix: compute the new visibility inline with `evaluateAll()` using the new values, then pass directly to `computeAllCalculations()`.

---

## 5. Drag-and-Drop

**Prompt**: Implement a custom Pointer Events drag-to-reorder hook without libraries.

**Verified**: `requestAnimationFrame` throttling prevents layout thrashing. Insert index is computed by comparing cursor Y against each card's midpoint — correct at all scroll positions.

**Iterated**: The initial implementation used a `overId` swap mechanic (blue outline on the hovered card) — jarring and imprecise. Replaced with a gap-based `insertIndex` model and animated `translateY` displacement on surrounding cards (150ms ease). The dragged card goes `visibility: hidden` in-place so its layout space is preserved; a fixed-position full-card clone follows the cursor imperatively via direct DOM mutation (`cloneRef.current.style.top`) — no React state update on every `pointermove`.

**Extended**: Added drag-from-palette — field types in the left panel can be dragged onto the canvas at a specific position. A `BuilderDragContext` shared between `FieldPalette` and `BuilderCanvas` coordinates the two drag modes (`reorder` vs `add`). During palette drag, a dimmed placeholder card is injected into the flex column at the insertion point, physically pushing other cards aside. On drop, the real field appears in its place.

**Bug fixed**: Downward drops placed the card one slot too high. The `insertIndex - 1` adjustment in `handlePointerUp` was wrong — `getInsertIndexAtPoint` already operates in the N-1 remaining space, which is exactly what `reorder(items, fromIdx, toIdx)` expects. Removed the adjustment.

---

## 6. Codebase Refactoring & Hydration Audit

**Prompt**: Enforce Next.js App Router conventions, React 19 best practices, and audit for hydration mismatches.

**Done**: Extracted client wrappers from all 4 `page.tsx` files (server → `*PageClient.tsx` pattern). Split multi-export files into one component per file (`Skeleton`, `ConfigRow` → individual files). Extracted shared icons into `Icons.tsx`. Moved helper functions to `lib/utils.ts`. Applied `<Activity>` to builder tabs for state preservation. Removed stale `src/modules/` references.

**Hydration findings**: Three `*PageClient.tsx` files maintained local `isHydrated` state — a component-local proxy for a global concern. `StoreProvider` used `useMemo` (RTK docs specify `useRef` + lazy init for concurrent mode).

**Fixed**: Added `storageReady` to a Redux `appSlice`. `useStorageHydration` dispatches `setStorageReady()` when hydration completes. `StoreProvider` uses `useState` lazy initializer (React 19's lint rules flag `ref.current` reads in render). `suppressHydrationWarning` on `<body>` for browser extension noise. Verified: clean build, zero TS errors.
