"use client";

import { memo, useState, useRef, useEffect, useMemo } from "react";
import type { HTMLAttributes } from "react";
import type { FormField, FieldType } from "@/entities/field";
import { cn } from "@/lib/utils";
import { getAllFieldEntries } from "@/lib/field-registry/registry";
import { ChevronUpIcon, ChevronDownIcon, GripIcon, TrashIcon, IconPlus } from "@/shared/ui";
import { Badge } from "@/shared/ui";
import { FieldIcon } from "./FieldIcon";
import { FieldPreview } from "./FieldPreview";

export const TYPE_LABEL: Record<FormField["type"], string> = {
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

export interface BuilderFieldCardProps {
  field: FormField;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddField: (type: FieldType) => void;
  dragHandleProps: HTMLAttributes<HTMLElement>;
  itemProps: HTMLAttributes<HTMLElement>;
}

export const BuilderFieldCard = memo(function BuilderFieldCard({
  field,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddField,
  dragHandleProps,
  itemProps,
}: BuilderFieldCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const fieldEntries = useMemo(() => getAllFieldEntries(), []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        addBtnRef.current &&
        !addBtnRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  function handleAddBtnClick(e: React.MouseEvent) {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  }

  function handleFieldSelect(type: FieldType) {
    onAddField(type);
    setDropdownOpen(false);
  }

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

      <div
        className={cn(
          "flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          ref={addBtnRef}
          aria-label="Add field after this"
          onClick={handleAddBtnClick}
          className="p-1 rounded text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
        >
          <IconPlus />
        </button>
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

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface border border-border rounded-md shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-60 overflow-y-auto py-1">
            {fieldEntries.map((entry) => (
              <button
                key={entry.type}
                type="button"
                onClick={() => handleFieldSelect(entry.type)}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-text-primary hover:bg-sidebar transition-colors"
              >
                <span className="shrink-0 text-text-secondary">
                  <FieldIcon type={entry.type} className="w-4 h-4" />
                </span>
                <span>{entry.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
