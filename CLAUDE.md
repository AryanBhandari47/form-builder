# CLAUDE.md — Project Best Practices

## Next.js App Router

### Server Components by Default
- `page.tsx` files are **Server Components** — no `"use client"` directive
- Client logic lives in `src/components/` — imported by the page
- Pattern: `page.tsx` renders `<SomethingClient />` (thin wrapper, zero logic)

```tsx
// app/templates/page.tsx — Server Component
import TemplatesPageClient from '@/components/templates/TemplatesPageClient'
export default function TemplatesPage() {
  return <TemplatesPageClient />
}
```

### When to Use `"use client"`
- Component uses hooks (`useState`, `useEffect`, `useSelector`, etc.)
- Component uses browser APIs (`window`, `localStorage`, etc.)
- Component is a leaf node in the component tree (no children importing it as server)

### File Co-location
- `src/app/` contains only `page.tsx`, `layout.tsx`, `error.tsx`, `globals.css`
- All client components live in `src/components/` with domain-based folders
- Custom hooks live in `src/hooks/`
- Pure logic (engines, registry, storage) lives in `src/lib/`
- Shared components live in `shared/ui/`

---

## React 19

### Activity API
Use `<Activity mode="visible" | "hidden">` to preserve component state when toggling visibility:
- Tabs that should keep scroll position and form state
- Conditional panels that switch frequently
- Never unmount/remount expensive subtrees

```tsx
<Activity mode={activeTab === "build" ? "visible" : "hidden"}>
  <BuilderCanvas />
</Activity>
```

### Rules of Hooks
- Don't call hooks inside conditions or loops
- Don't call hooks from regular functions — only from React functions or custom hooks
- Custom hooks must start with `use`

---

## Redux Toolkit

### Slice Structure
- One slice per domain: `templatesSlice`, `responsesSlice`, `fillSlice`, `builderUiSlice`
- Use `createEntityAdapter` for normalized collections (templates, responses)
- Selectors live in `store/selectors/` — use `createSelector` for memoization

### Selector Patterns
```tsx
// Factory selector — returns a new memoized selector per argument
export const selectTemplateById = (id: string) =>
  createSelector(selectAllTemplates, (templates) =>
    templates.find((t) => t.id === id) ?? null
  )
```

### Dispatch Typing
```tsx
const dispatch = useDispatch<AppDispatch>()
```

---

## TypeScript

### Discriminated Unions
- Field types use `type` as discriminant — never use type assertions to narrow
- Pattern: `if (field.type === 'single-line') { /* TS narrows here */ }`

### Strict Mode
- `strict: true` in tsconfig — no `any`, no implicit undefined
- Use `unknown` over `any` for external data
- Use `satisfies` for object literal validation where possible

---

## File Structure Rules

### One Component Per File
- Each `.tsx` file exports exactly one component
- Sub-components that are only used by one parent get their own file
- Barrel exports (`index.ts`) only re-export, never define components

### Icons
- Shared icons (used in 2+ files) go in `shared/ui/Icons.tsx`
- Page-specific icons stay in the client component file
- Never duplicate the same SVG across files

### Utility Functions
- Pure functions without React dependencies → `lib/utils.ts`
- Domain-specific helpers (response formatting, file sizing) → `lib/utils.ts`
- Helper functions that depend on React/hooks → stay in the component file
- Engine logic (conditional, calculation) → `modules/*/`

---

## Import Conventions

### Path Aliases
```tsx
import { cn } from '@/lib/utils'           // @ = src/
import { Button } from '@/shared/ui'       // barrel import
import { selectTemplateById } from '@/store/selectors/templateSelectors'
```

### Import Order
1. React / Next.js
2. Third-party (Redux, Zod, etc.)
3. Internal aliases (`@/store`, `@/entities`, `@/lib`, `@/components`, `@/shared`, `@/hooks`)
4. Relative imports (same module)

---

## Component Patterns

### Memoization
- `React.memo` for components that render often but change rarely (field cards)
- `useCallback` for event handlers passed to memoized children
- `useSelector` with inline selectors — avoid creating selector functions outside render

### CSS / Tailwind
- Use `cn()` (clsx + tailwind-merge) for conditional classes
- CSS variables for design tokens: `var(--radius-sm)`, `var(--color-primary)`
- No inline styles except dynamic values (e.g., `transform: translateY()`)
- `suppressHydrationWarning` on `<body>` to tolerate browser extension mutations

### Forms
- Fill form state lives in Redux (`fill` slice), not local state
- Initialize fill state via `useEffect` — wait for async data before initializing
- Conditional rendering: hidden fields excluded from validation and submission

---

## Testing

- Engine tests: pure input → output, no mocks
- Component tests: only for complex交互 logic
- Run `npm run test` before committing

---

## Build / Dev

```bash
npm run dev          # localhost:3000
npm run build        # production build — must pass before commit
npm run lint         # eslint
npm run test         # vitest
```
