"use client";

import * as React from "react";
import type { FileUploadField } from "@/entities/field";
import type { FieldValue, FileMetadata } from "@/entities/response";
import { cn, formatFileSize } from "@/lib/utils";

interface FileUploadFillFieldProps {
  field: FileUploadField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  error?: string[];
  isRequired: boolean;
  isDisabled?: boolean;
}

function FileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M9 2v4h4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2l8 8M10 2l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const FileUploadFillField = React.memo(function FileUploadFillField({
  field,
  value,
  onChange,
  onBlur,
  error,
  isRequired,
  isDisabled = false,
}: FileUploadFillFieldProps) {
  const inputId = `field-${field.id}`;
  const hasError = error && error.length > 0;
  const files: FileMetadata[] = Array.isArray(value)
    ? (value as FileMetadata[])
    : [];
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const existing = files;
    const toAdd: FileMetadata[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i];
      if (!f) continue;
      if (existing.length + toAdd.length >= field.maxFiles) break;
      toAdd.push({ name: f.name, size: f.size, type: f.type });
    }
    const next = [...existing, ...toAdd];
    onChange(next.length > 0 ? next : null);
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  const canAddMore = files.length < field.maxFiles;

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

      {canAddMore && !isDisabled && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload files for ${field.label}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 px-4 py-8",
            "border-2 border-dashed rounded-[var(--radius-md)] cursor-pointer",
            "transition-colors text-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isDragging
              ? "border-primary bg-primary-light/30"
              : hasError
              ? "border-red bg-red-light/20 hover:border-red"
              : "border-border bg-sidebar/50 hover:border-primary hover:bg-primary-light/10"
          )}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-text-muted"
          >
            <path
              d="M12 15V3M8 7l4-4 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 18v1a2 2 0 002 2h14a2 2 0 002-2v-1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <p className="text-sm text-text-secondary">
              Drop files here or{" "}
              <span className="text-primary font-medium">browse</span>
            </p>
            {field.allowedTypes && (
              <p className="text-xs text-text-muted mt-0.5">
                Accepted: {field.allowedTypes}
              </p>
            )}
            <p className="text-xs text-text-muted mt-0.5">
              Up to {field.maxFiles} file{field.maxFiles !== 1 ? "s" : ""}
              {files.length > 0 && ` (${files.length} selected)`}
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={field.allowedTypes}
        multiple={field.maxFiles > 1}
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
        aria-hidden="true"
        tabIndex={-1}
      />

      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5 mt-1">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 px-3 py-2 bg-sidebar rounded-sm border border-border group"
            >
              <span className="text-text-muted flex-shrink-0">
                <FileIcon />
              </span>
              <span className="flex-1 min-w-0 text-sm text-text-primary truncate">
                {file.name}
              </span>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatFileSize(file.size)}
              </span>
              {!isDisabled && (
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${file.name}`}
                  className="text-text-muted hover:text-red transition-colors flex-shrink-0"
                >
                  <XIcon />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

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
