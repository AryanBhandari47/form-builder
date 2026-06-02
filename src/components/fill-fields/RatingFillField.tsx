"use client";

import { useState, useRef, memo } from "react";
import type { DragEvent } from "react";
import type { FileUploadField, RatingField } from "@/entities/field";
import type { FieldValue, FileMetadata } from "@/entities/response";
import { cn, formatFileSize } from "@/lib/utils";
import { FileIcon, XIcon } from "@/shared/ui";

interface RatingFillFieldProps {
  field: RatingField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  error?: string[];
  isRequired: boolean;
  isDisabled?: boolean;
}

export const RatingFillField = memo(function RatingFillField({
  field,
  value,
  onChange,
  onBlur: _onBlur,
  error,
  isRequired,
  isDisabled = false,
}: RatingFillFieldProps) {
  const inputId = `field-${field.id}`;
  const hasError = error && error.length > 0;
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-text-primary">
        {field.label}
        {isRequired && (
          <span className="text-red ml-1" aria-hidden="true">
            *
          </span>
        )}
      </p>

          {
              
          }

      {hasError && (
        <ul className="flex flex-col gap-0.5" role="alert">
          {error.map((msg, i) => (
            <li key={i} className="text-xs text-red">
              {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
