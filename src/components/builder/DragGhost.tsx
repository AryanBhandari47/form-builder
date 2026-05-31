"use client";

import type { FieldType } from "@/entities/field";
import { FieldIcon } from "./FieldIcon";

interface DragGhostProps {
  x: number;
  y: number;
  label: string;
  fieldType: FieldType;
}

export function DragGhost({ x, y, label, fieldType }: DragGhostProps) {
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
