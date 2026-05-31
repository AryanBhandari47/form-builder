"use client";

import { useRef, useMemo, memo, useEffect, useState } from "react";
import type { HTMLAttributes, RefObject } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import type { FormField, FieldType } from "@/entities/field";
import { selectTemplateFields } from "@/store/selectors/templateSelectors";
import { setSelectedField, setDirty } from "@/store/slices/builderUiSlice";
import { removeField, reorderFields, addField } from "@/store/slices/templatesSlice";
import { useDragToReorder } from "@/hooks/useDragToReorder";
import { useBuilderDrag } from "@/contexts/BuilderDragContext";
import { getFieldEntry } from "@/lib/field-registry/registry";
import { generateId, cn } from "@/lib/utils";
import { ChevronUpIcon, ChevronDownIcon, GripIcon, TrashIcon, IconPlus } from "@/shared/ui";
import { FieldIcon } from "./FieldIcon";
import { FieldPreview } from "./FieldPreview";
import { Badge } from "@/shared/ui";

// ─────────────────────────────────────────────────────────────────────────────
// Field type → display label (short)
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<FormField["type"], string> = {
  "single-line": "Text",
  "multi-line": "Textarea",
  number: "Number",
  date: "Date",
  "single-select": "Single Select",
  "multi-select": "Multi Select",
  "file-upload": "File Upload",
  "section-header": "Section",
  calculation: "Calc",
};

// ─────────────────────────────────────────────────────────────────────────────
// AddGhostCard — placeholder card shown in the list during palette-add drag
// ─────────────────────────────────────────────────────────────────────────────

interface AddGhostCardProps {
  fieldType: FieldType;
  label: string;
}

function AddGhostCard({ fieldType, label }: AddGhostCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-md",
        "border-2 border-dashed border-primary bg-primary-light/30",
        "pointer-events-none select-none opacity-70"
      )}
    >
      <span className="shrink-0 p-1">
        <GripIcon />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-primary">
            <FieldIcon type={fieldType} className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-primary truncate flex-1">
            {label}
          </span>
          <Badge variant="default" className="shrink-0 text-[9px] py-0">
            {TYPE_LABEL[fieldType]}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DragGhost — floating chip used only for palette-add mode
// ─────────────────────────────────────────────────────────────────────────────

interface DragGhostProps {
  x: number;
  y: number;
  label: string;
  fieldType: FieldType;
}

function DragGhost({ x, y, label, fieldType }: DragGhostProps) {
  return (
    <div
      style={{
        position: "fixed",
        left: x + 14,
        top: y - 18,
        pointerEvents: "none",
        zIndex: 9999,
      }}
      className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-primary rounded-md shadow-lg text-xs font-medium text-primary max-w-[180px]"
    >
      <FieldIcon type={fieldType} className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BuilderFieldCard
// ─────────────────────────────────────────────────────────────────────────────

interface BuilderFieldCardProps {
  field: FormField;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps: HTMLAttributes<HTMLElement>;
  itemProps: HTMLAttributes<HTMLElement>;
}

const BuilderFieldCard = memo(function BuilderFieldCard({
  field,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
  itemProps,
}: BuilderFieldCardProps) {
  return (
    <div
      role="option"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
        if (itemProps.onKeyDown) {
          (itemProps.onKeyDown as (e: React.KeyboardEvent) => void)(e);
        }
      }}
      aria-selected={isSelected}
      data-drag-id={(itemProps as { "data-drag-id"?: string })["data-drag-id"]}
      style={(itemProps as { style?: React.CSSProperties }).style}
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-md",
        "border cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isSelected
          ? "border-primary bg-primary-light/40 shadow-sm"
          : "border-border bg-surface hover:border-primary/40 hover:shadow-sm"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
        {...dragHandleProps}
        className={cn(
          "shrink-0 mt-0.5 p-1 rounded",
          "text-text-muted hover:text-text-secondary",
          "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
          "cursor-grab active:cursor-grabbing"
        )}
        tabIndex={0}
      >
        <GripIcon />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("shrink-0", isSelected ? "text-primary" : "text-text-secondary")}>
            <FieldIcon type={field.type} className="w-4 h-4" />
          </span>
          <span className={cn("text-xs font-semibold truncate flex-1", isSelected ? "text-primary" : "text-text-primary")}>
            {field.label}
          </span>
          <Badge variant="default" className="shrink-0 text-[9px] py-0">
            {TYPE_LABEL[field.type]}
          </Badge>
          {field.defaultRequired && (
            <span className="text-red text-xs font-semibold shrink-0" title="Required">*</span>
          )}
        </div>
        <div className="pointer-events-none select-none">
          <FieldPreview field={field} />
        </div>
      </div>

      {/* Action buttons */}
      <div
        className={cn(
          "flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Move field up"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-sidebar disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUpIcon />
        </button>
        <button
          type="button"
          aria-label="Move field down"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-sidebar disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDownIcon />
        </button>
        <button
          type="button"
          aria-label="Delete field"
          onClick={onDelete}
          className="p-1 rounded text-text-muted hover:text-red hover:bg-red-light transition-colors mt-1"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// BuilderCanvas
// ─────────────────────────────────────────────────────────────────────────────

interface BuilderCanvasProps {
  templateId: string;
}

export function BuilderCanvas({ templateId }: BuilderCanvasProps) {
  const dispatch = useDispatch<AppDispatch>();
  const canvasRef = useRef<HTMLElement>(null);
  const dragCtx = useBuilderDrag();

  const fields = useSelector(
    (state: RootState) => selectTemplateFields(templateId)(state) ?? []
  );

  const selectedFieldId = useSelector(
    (state: RootState) => state.builderUi.selectedFieldId
  );

  const fieldIds = useMemo(() => fields.map((f) => f.id), [fields]);

  const itemMeta = useMemo(
    () =>
      Object.fromEntries(
        fields.map((f) => [f.id, { label: f.label, type: f.type }])
      ) as Record<string, { label: string; type: FieldType }>,
    [fields]
  );

  const [addInsertIndex, setAddInsertIndex] = useState<number | null>(null);
  const addInsertIndexRef = useRef<number | null>(null);
  const addRafRef = useRef<number | null>(null);

  const { reorderDragState, cloneRef, getDragHandleProps, getItemProps } =
    useDragToReorder({
      items: fieldIds,
      itemMeta,
      onReorder: (newOrder) => {
        dispatch(reorderFields({ templateId, orderedIds: newOrder }));
        dispatch(setDirty(true));
      },
      containerRef: canvasRef as RefObject<HTMLElement>,
    });

  // Track cursor and handle drop for palette drag-to-add
  useEffect(() => {
    if (dragCtx.dragState.mode !== "add") {
      setAddInsertIndex(null);
      addInsertIndexRef.current = null;
      return;
    }

    function handleMove(e: PointerEvent) {
      if (addRafRef.current !== null) return;
      addRafRef.current = requestAnimationFrame(() => {
        addRafRef.current = null;
        const container = canvasRef.current;
        if (!container) return;

        const els = Array.from(
          container.querySelectorAll<HTMLElement>("[data-drag-id]")
        );
        let idx = els.length;
        for (let i = 0; i < els.length; i++) {
          const rect = els[i].getBoundingClientRect();
          if (e.clientY < rect.top + rect.height / 2) {
            idx = i;
            break;
          }
        }
        if (idx !== addInsertIndexRef.current) {
          addInsertIndexRef.current = idx;
          setAddInsertIndex(idx);
        }
      });
    }

    function handleUp() {
      if (addRafRef.current !== null) {
        cancelAnimationFrame(addRafRef.current);
        addRafRef.current = null;
      }

      const insertIdx = addInsertIndexRef.current;
      const addType = dragCtx.dragState.addFieldType;

      if (addType !== null && insertIdx !== null) {
        const entry = getFieldEntry(addType);
        const newField = {
          id: generateId(),
          type: addType,
          order: 0,
          conditions: [],
          defaultVisibility: "visible" as const,
          defaultRequired: false,
          ...entry.defaultConfig,
        } as FormField;

        const newIds = [...fieldIds];
        newIds.splice(insertIdx, 0, newField.id);

        dispatch(addField({ templateId, field: newField }));
        dispatch(reorderFields({ templateId, orderedIds: newIds }));
        dispatch(setSelectedField(newField.id));
        dispatch(setDirty(true));
      }

      dragCtx.endDrag();
      addInsertIndexRef.current = null;
      setAddInsertIndex(null);

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      if (addRafRef.current !== null) cancelAnimationFrame(addRafRef.current);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragCtx.dragState.mode, dragCtx.dragState.addFieldType]);

  function handleSelect(fieldId: string) {
    dispatch(setSelectedField(fieldId));
  }

  function handleDelete(fieldId: string) {
    dispatch(removeField({ templateId, fieldId }));
    dispatch(setDirty(true));
    if (selectedFieldId === fieldId) dispatch(setSelectedField(null));
  }

  function handleMoveUp(index: number) {
    if (index <= 0) return;
    const newOrder = fields.map((f) => f.id);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    dispatch(reorderFields({ templateId, orderedIds: newOrder }));
    dispatch(setDirty(true));
  }

  function handleMoveDown(index: number) {
    if (index >= fields.length - 1) return;
    const newOrder = fields.map((f) => f.id);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    dispatch(reorderFields({ templateId, orderedIds: newOrder }));
    dispatch(setDirty(true));
  }

  function scrollToPalette() {
    const aside = document.querySelector('aside[aria-label="Field type palette"]');
    if (aside) {
      aside.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = aside.querySelector('input[type="search"]');
      if (input instanceof HTMLInputElement) input.focus();
    }
  }

  const { dragState } = dragCtx;
  const isAdding = dragState.mode === "add";

  // Full-card clone for reorder drag
  const draggingField = reorderDragState.draggingId
    ? fields.find((f) => f.id === reorderDragState.draggingId) ?? null
    : null;

  if (fields.length === 0) {
    return (
      <main
        ref={canvasRef as RefObject<HTMLElement>}
        className="flex-1 flex flex-col items-center justify-center bg-canvas overflow-y-auto p-8"
        aria-label="Form canvas"
      >
        {isAdding && dragState.ghostFieldType && (
          <DragGhost x={dragState.ghostX} y={dragState.ghostY} label={dragState.ghostLabel} fieldType={dragState.ghostFieldType} />
        )}
        <div className="text-center max-w-sm w-full">
          {isAdding && dragState.ghostFieldType && (
              <div className="mb-4">
                <AddGhostCard fieldType={dragState.ghostFieldType} label={dragState.ghostLabel} />
              </div>
            )}
          <div className="w-16 h-16 rounded-lg bg-surface border border-border flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-text-muted">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">No fields yet</h3>
          <p className="text-xs text-text-muted mb-4">Add a field from the left panel to start building your form.</p>
          <button
            type="button"
            onClick={scrollToPalette}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2",
              "bg-primary text-white text-xs font-medium rounded-sm",
              "hover:bg-primary-hover transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            <IconPlus />
            Add your first field
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={canvasRef as RefObject<HTMLElement>}
      className="flex-1 flex flex-col bg-canvas overflow-y-auto"
      aria-label="Form canvas"
    >
      {/* Palette-add ghost chip */}
      {isAdding && dragState.ghostFieldType && (
        <DragGhost x={dragState.ghostX} y={dragState.ghostY} label={dragState.ghostLabel} fieldType={dragState.ghostFieldType} />
      )}

      {/* Full-card clone for reorder — fixed positioned, follows cursor imperatively */}
      {draggingField && reorderDragState.cardRect && (
        <div
          ref={cloneRef as unknown as RefObject<HTMLDivElement>}
          style={{
            position: "fixed",
            left: reorderDragState.cardRect.left,
            top: reorderDragState.cardRect.top,
            width: reorderDragState.cardRect.width,
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
            borderRadius: 6,
            opacity: 0.97,
          }}
        >
          <BuilderFieldCard
            field={draggingField}
            isSelected={false}
            isFirst={false}
            isLast={false}
            onSelect={() => {}}
            onDelete={() => {}}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
            dragHandleProps={{}}
            itemProps={{
              "data-drag-id": draggingField.id,
              style: {},
              onKeyDown: () => {},
            } as HTMLAttributes<HTMLElement>}
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id}>
            {isAdding && addInsertIndex === index && dragState.ghostFieldType && (
              <AddGhostCard fieldType={dragState.ghostFieldType} label={dragState.ghostLabel} />
            )}
            <BuilderFieldCard
              field={field}
              isSelected={selectedFieldId === field.id}
              isFirst={index === 0}
              isLast={index === fields.length - 1}
              onSelect={() => handleSelect(field.id)}
              onDelete={() => handleDelete(field.id)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              dragHandleProps={getDragHandleProps(field.id) as HTMLAttributes<HTMLElement>}
              itemProps={getItemProps(field.id) as HTMLAttributes<HTMLElement>}
            />
          </div>
        ))}

        {isAdding && addInsertIndex === fields.length && dragState.ghostFieldType && (
          <AddGhostCard fieldType={dragState.ghostFieldType} label={dragState.ghostLabel} />
        )}

        <button
          type="button"
          onClick={scrollToPalette}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-3 mt-2",
            "border-2 border-dashed border-border rounded-md",
            "text-xs text-text-muted hover:text-primary hover:border-primary",
            "transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <IconPlus />
          Add Field
        </button>
      </div>
    </main>
  );
}
