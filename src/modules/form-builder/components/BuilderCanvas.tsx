"use client";

import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import type { FormField } from "@/entities/field";
import { selectTemplateFields } from "@/store/selectors/templateSelectors";
import { setSelectedField, setDirty } from "@/store/slices/builderUiSlice";
import { removeField, reorderFields } from "@/store/slices/templatesSlice";
import { useDragToReorder } from "@/modules/dnd/useDragToReorder";
import { cn } from "@/lib/utils";
import { ChevronUpIcon, ChevronDownIcon } from "@/shared/ui";
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
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="2.5" cy="3" r="1.25" fill="currentColor" />
      <circle cx="7.5" cy="3" r="1.25" fill="currentColor" />
      <circle cx="2.5" cy="7" r="1.25" fill="currentColor" />
      <circle cx="7.5" cy="7" r="1.25" fill="currentColor" />
      <circle cx="2.5" cy="11" r="1.25" fill="currentColor" />
      <circle cx="7.5" cy="11" r="1.25" fill="currentColor" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
  dragHandleProps: React.HTMLAttributes<HTMLElement>;
  itemProps: React.HTMLAttributes<HTMLElement>;
}

const BuilderFieldCard = React.memo(function BuilderFieldCard({
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
  const isSectionHeader = field.type === "section-header";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-selected={isSelected}
      {...itemProps}
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-[var(--radius-md)]",
        "border transition-all duration-[var(--transition-fast)] cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isSelected
          ? "border-primary bg-primary-light/40 shadow-sm"
          : "border-border bg-surface hover:border-primary/40 hover:shadow-sm"
      )}
      style={itemProps.style}
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
        {...dragHandleProps}
        className={cn(
          "flex-shrink-0 mt-0.5 p-1 rounded",
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
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              "flex-shrink-0",
              isSelected ? "text-primary" : "text-text-secondary"
            )}
          >
            <FieldIcon type={field.type} className="w-4 h-4" />
          </span>
          <span
            className={cn(
              "text-xs font-semibold truncate flex-1",
              isSelected ? "text-primary" : "text-text-primary"
            )}
          >
            {field.label}
          </span>
          <Badge variant="default" className="flex-shrink-0 text-[9px] py-0">
            {TYPE_LABEL[field.type]}
          </Badge>
          {field.defaultRequired && (
            <span
              className="text-red text-xs font-semibold flex-shrink-0"
              title="Required"
            >
              *
            </span>
          )}
        </div>

        {/* Preview */}
        <div className="pointer-events-none select-none">
          <FieldPreview field={field} />
        </div>
      </div>

      {/* Action buttons */}
      <div
        className={cn(
          "flex flex-col gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Move field up"
          onClick={onMoveUp}
          disabled={isFirst}
          className={cn(
            "p-1 rounded text-text-muted hover:text-text-primary hover:bg-sidebar",
            "disabled:opacity-30 disabled:cursor-not-allowed",
            "transition-colors"
          )}
        >
          <ChevronUpIcon />
        </button>
        <button
          type="button"
          aria-label="Move field down"
          onClick={onMoveDown}
          disabled={isLast}
          className={cn(
            "p-1 rounded text-text-muted hover:text-text-primary hover:bg-sidebar",
            "disabled:opacity-30 disabled:cursor-not-allowed",
            "transition-colors"
          )}
        >
          <ChevronDownIcon />
        </button>
        <button
          type="button"
          aria-label="Delete field"
          onClick={onDelete}
          className={cn(
            "p-1 rounded text-text-muted hover:text-red hover:bg-red-light",
            "transition-colors mt-1"
          )}
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
  const canvasRef = React.useRef<HTMLElement>(null);

  const fields = useSelector(
    (state: RootState) => selectTemplateFields(templateId)(state) ?? []
  );

  const selectedFieldId = useSelector(
    (state: RootState) => state.builderUi.selectedFieldId
  );

  const fieldIds = React.useMemo(() => fields.map((f) => f.id), [fields]);

  // DnD reorder
  const { getDragHandleProps, getItemProps } = useDragToReorder({
    items: fieldIds,
    onReorder: (newOrder) => {
      dispatch(reorderFields({ templateId, orderedIds: newOrder }));
      dispatch(setDirty(true));
    },
    containerRef: canvasRef as React.RefObject<HTMLElement>,
  });

  function handleSelect(fieldId: string) {
    dispatch(setSelectedField(fieldId));
  }

  function handleDelete(fieldId: string) {
    dispatch(removeField({ templateId, fieldId }));
    dispatch(setDirty(true));
    if (selectedFieldId === fieldId) {
      dispatch(setSelectedField(null));
    }
  }

  function handleMoveUp(index: number) {
    if (index <= 0) return;
    const newOrder = fields.map((f) => f.id);
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    dispatch(reorderFields({ templateId, orderedIds: newOrder }));
    dispatch(setDirty(true));
  }

  function handleMoveDown(index: number) {
    if (index >= fields.length - 1) return;
    const newOrder = fields.map((f) => f.id);
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    dispatch(reorderFields({ templateId, orderedIds: newOrder }));
    dispatch(setDirty(true));
  }

  function scrollToPalette() {
    const aside = document.querySelector(
      'aside[aria-label="Field type palette"]'
    );
    if (aside) {
      aside.scrollIntoView({ behavior: "smooth", block: "start" });
      const searchInput = aside.querySelector('input[type="search"]');
      if (searchInput instanceof HTMLInputElement) {
        searchInput.focus();
      }
    }
  }

  if (fields.length === 0) {
    return (
      <main
        className="flex-1 flex flex-col items-center justify-center bg-canvas overflow-y-auto p-8"
        aria-label="Form canvas"
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-surface border border-border flex items-center justify-center mx-auto mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-text-muted"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 10h8M8 14h5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            No fields yet
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Add a field from the left panel to start building your form.
          </p>
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
            <PlusIcon />
            Add your first field
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={canvasRef as React.RefObject<HTMLElement>}
      className="flex-1 flex flex-col bg-canvas overflow-y-auto"
      aria-label="Form canvas"
    >
      <div className="max-w-2xl mx-auto w-full px-6 py-6 flex flex-col gap-2">
        {fields.map((field, index) => (
          <BuilderFieldCard
            key={field.id}
            field={field}
            isSelected={selectedFieldId === field.id}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
            onSelect={() => handleSelect(field.id)}
            onDelete={() => handleDelete(field.id)}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            dragHandleProps={
              getDragHandleProps(field.id) as React.HTMLAttributes<HTMLElement>
            }
            itemProps={
              getItemProps(field.id) as React.HTMLAttributes<HTMLElement>
            }
          />
        ))}

        {/* Add Field footer button */}
        <button
          type="button"
          onClick={scrollToPalette}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-3 mt-2",
            "border-2 border-dashed border-border rounded-[var(--radius-md)]",
            "text-xs text-text-muted hover:text-primary hover:border-primary",
            "transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <PlusIcon />
          Add Field
        </button>
      </div>
    </main>
  );
}
