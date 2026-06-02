"use client";

import { useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import type { FormField, FieldType } from "@/entities/field";
import { getAllFieldEntries } from "@/lib/field-registry";
import {
  setSelectedField,
  setDirty,
  setSearchQuery,
} from "@/store/slices/builderUiSlice";
import { addField } from "@/store/slices/templatesSlice";
import { selectTemplateFields } from "@/store/selectors/templateSelectors";
import { generateId, cn } from "@/lib/utils";
import { useBuilderDrag } from "@/contexts/BuilderDragContext";
import { FieldIcon } from "./FieldIcon";
import { GripIcon, IconSearch } from "@/shared/ui";

// ─────────────────────────────────────────────────────────────────────────────
// Category grouping
// ─────────────────────────────────────────────────────────────────────────────

type FieldCategory =
  | "Basic Fields"
  | "Choice Fields"
  | "Media"
  | "Layout"
  | "Logic";

const CATEGORY_ORDER: FieldCategory[] = [
  "Basic Fields",
  "Choice Fields",
  "Media",
  "Layout",
  "Logic",
];

const TYPE_TO_CATEGORY: Record<FieldType, FieldCategory> = {
  "single-line": "Basic Fields",
  "multi-line": "Basic Fields",
  number: "Basic Fields",
  date: "Basic Fields",
  "single-select": "Choice Fields",
  "multi-select": "Choice Fields",
  "file-upload": "Media",
  "section-header": "Layout",
  calculation: "Logic",
  rating: "Basic Fields",
};

// ─────────────────────────────────────────────────────────────────────────────
// Descriptions per type
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_DESCRIPTIONS: Record<FieldType, string> = {
  "single-line": "Short text, one line",
  "multi-line": "Longer text, multiple lines",
  number: "Numeric input with validation",
  date: "Date picker with range limits",
  "single-select": "Pick one from a list",
  "multi-select": "Pick multiple from a list",
  "file-upload": "Attach files or images",
  "section-header": "Visual divider / heading",
  calculation: "Auto-compute from numbers",
  rating: "Star rating",
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface FieldPaletteProps {
  templateId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function FieldPalette({ templateId }: FieldPaletteProps) {
  const dispatch = useDispatch<AppDispatch>();
  const dragCtx = useBuilderDrag();

  const searchQuery = useSelector(
    (state: RootState) => state.builderUi.searchQuery
  );

  const existingFields = useSelector(
    (state: RootState) => selectTemplateFields(templateId)(state) ?? []
  );

  const allEntries = useMemo(() => getAllFieldEntries(), []);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allEntries;
    return allEntries.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        TYPE_DESCRIPTIONS[e.type].toLowerCase().includes(q)
    );
  }, [allEntries, searchQuery]);

  const grouped = useMemo(() => {
    const map = new Map<FieldCategory, typeof filteredEntries>();
    for (const entry of filteredEntries) {
      const cat = TYPE_TO_CATEGORY[entry.type];
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(entry);
    }
    return map;
  }, [filteredEntries]);

  function handleAddField(type: FieldType) {
    const entry = allEntries.find((e) => e.type === type);
    if (!entry) return;

    const newField = {
      id: generateId(),
      type,
      order: existingFields.length,
      conditions: [],
      defaultVisibility: "visible",
      defaultRequired: false,
      ...entry.defaultConfig,
    } as FormField;

    dispatch(addField({ templateId, field: newField }));
    dispatch(setSelectedField(newField.id));
    dispatch(setDirty(true));
  }

  // Per-item drag start tracking to distinguish click vs drag
  const dragStartRef = useRef<{
    x: number;
    y: number;
    type: FieldType;
    label: string;
  } | null>(null);
  const dragActivatedRef = useRef(false);

  function handleItemPointerDown(
    e: React.PointerEvent,
    type: FieldType,
    label: string
  ) {
    // Only main button
    if (e.button !== 0) return;

    dragStartRef.current = { x: e.clientX, y: e.clientY, type, label };
    dragActivatedRef.current = false;

    function handleMove(moveEvent: PointerEvent) {
      if (!dragStartRef.current || dragActivatedRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        dragActivatedRef.current = true;
        dragCtx.startAdd(
          dragStartRef.current.type,
          dragStartRef.current.label,
          moveEvent.clientX,
          moveEvent.clientY
        );
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      }
    }

    function handleUp() {
      if (!dragActivatedRef.current && dragStartRef.current) {
        // Short press with no drag → treat as click
        handleAddField(dragStartRef.current.type);
      }
      dragStartRef.current = null;
      dragActivatedRef.current = false;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <aside
      className="flex flex-col h-full bg-surface border-r border-border overflow-hidden"
      aria-label="Field type palette"
    >
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          Add Fields
        </h2>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <IconSearch />
          </span>
          <input
            type="search"
            placeholder="Search field types..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className={cn(
              "w-full h-8 pl-8 pr-3",
              "bg-sidebar border border-border rounded-sm",
              "text-xs text-text-primary placeholder:text-text-muted",
              "outline-none",
              "transition-colors"
            )}
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto py-2">
        {filteredEntries.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-text-muted">
            No field types match &ldquo;{searchQuery}&rdquo;
          </div>
        )}

        {CATEGORY_ORDER.map((cat) => {
          const entries = grouped.get(cat);
          if (!entries || entries.length === 0) return null;

          return (
            <div key={cat} className="mb-1">
              {/* Category label */}
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {cat}
              </p>

              {/* Field type items */}
              {entries.map((entry) => (
                <button
                  key={entry.type}
                  type="button"
                  onPointerDown={(e) =>
                    handleItemPointerDown(e, entry.type, entry.label)
                  }
                  className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 mx-1",
                    "rounded-sm",
                    "hover:bg-primary-light",
                    "transition-colors duration-(--transition-fast)",
                    "text-left cursor-grab active:cursor-grabbing",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  title={`Add ${entry.label} field`}
                  style={{ width: "calc(100% - 8px)" }}
                >
                  {/* Drag handle */}
                  <span
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  >
                    <GripIcon />
                  </span>

                  {/* Icon */}
                  <span className="shrink-0 text-text-secondary transition-colors">
                    <FieldIcon type={entry.type} className="w-4 h-4" />
                  </span>

                  {/* Text */}
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-medium text-text-primary leading-tight">
                      {entry.label}
                    </span>
                    <span className="block text-[10px] text-text-muted leading-tight mt-0.5 truncate">
                      {TYPE_DESCRIPTIONS[entry.type]}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
