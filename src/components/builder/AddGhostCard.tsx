"use client";

import type { FieldType } from "@/entities/field";
import { cn } from "@/lib/utils";
import { GripIcon, Badge } from "@/shared/ui";
import { FieldIcon } from "./FieldIcon";
import { TYPE_LABEL } from "./BuilderFieldCard";

interface AddGhostCardProps {
  fieldType: FieldType;
  label: string;
}

export function AddGhostCard({ fieldType, label }: AddGhostCardProps) {
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
