"use client";

import { useRef, useMemo, useEffect, useState } from "react";
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
import { IconPlus } from "@/shared/ui";
import { BuilderFieldCard } from "./BuilderFieldCard";
import { AddGhostCard } from "./AddGhostCard";
import { DragGhost } from "./DragGhost";

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
          defaultVisibility: "visible",
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

  function handleAddField(type: FieldType, index: number) {
    const entry = getFieldEntry(type);
    const newField = {
      id: generateId(),
      type,
      order: 0,
      conditions: [],
      defaultVisibility: "visible",
      defaultRequired: false,
      ...entry.defaultConfig,
    } as FormField;

    const newIds = [...fieldIds];
    console.log(index);
    newIds.splice(index + 1, 0, newField.id);

    dispatch(addField({ templateId, field: newField }));
    dispatch(reorderFields({ templateId, orderedIds: newIds }));
    dispatch(setSelectedField(newField.id));
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
      {isAdding && dragState.ghostFieldType && (
        <DragGhost x={dragState.ghostX} y={dragState.ghostY} label={dragState.ghostLabel} fieldType={dragState.ghostFieldType} />
      )}

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
            onAddField={() => {}}
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
              onAddField={(type) => handleAddField(type, index)}
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
