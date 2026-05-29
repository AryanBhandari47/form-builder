"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { FormTemplate } from "@/entities/template";
import { formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TemplateCardProps {
  template: FormTemplate;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template icon (simple colored shape using first letter)
// ─────────────────────────────────────────────────────────────────────────────

function TemplateIcon({ title }: { title: string }) {
  return (
    <div
      className="flex items-center justify-center w-9 h-9 rounded-sm text-sm font-semibold text-primary"
      style={{ backgroundColor: "var(--color-primary-light)" }}
    >
      {title.charAt(0).toUpperCase()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TemplateCard({ template, className }: TemplateCardProps) {
  const router = useRouter();
  const fieldCount = template.fieldIds.length;

  function handleCardClick() {
    router.push(`/templates/${template.id}`);
  }

  function handleUseTemplate(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/fill/${template.id}/new`);
  }

  function handlePreview(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/templates/${template.id}?tab=preview`);
  }

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "group relative bg-surface border border-border rounded-[var(--radius-lg)]",
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
        "transition-shadow duration-[var(--transition-slow)] cursor-pointer",
        "flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-primary flex-shrink-0" />

      {/* Card body */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Icon + badge row */}
        <div className="flex items-center justify-between gap-2">
          <TemplateIcon title={template.title} />
          <Badge variant="info">Form</Badge>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
          {template.title}
        </h3>

        {/* Description */}
        {template.description && (
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        )}

        {/* Meta */}
        <p className="text-xs text-text-muted mt-auto">
          {fieldCount} {fieldCount === 1 ? "field" : "fields"}
          {" · "}
          {template.responseCount}{" "}
          {template.responseCount === 1 ? "response" : "responses"}
          {" · "}
          Modified {formatRelativeDate(template.updatedAt)}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border-subtle mx-4" />

      {/* Footer actions */}
      <div className="flex gap-2 p-3" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handlePreview}
        >
          Preview
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={handleUseTemplate}
        >
          Use Template
        </Button>
      </div>
    </article>
  );
}
