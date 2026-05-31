"use client";

import "@/lib/field-registry";

import Link from "next/link";
import { useSelector } from "react-redux";
import { selectTemplateById } from "@/store/selectors/templateSelectors";
import type { RootState } from "@/store";
import { Spinner } from "@/shared/ui/Spinner";
import { XIcon } from "@/shared/ui";
import { FillForm } from "@/components/fill-form/FillForm";
import { LogoIcon } from "./LogoIcon";

export default function FillPageClient({
  templateId,
  responseId,
}: {
  templateId: string;
  responseId: string;
}) {
  const storageReady = useSelector((state: RootState) => state.app.storageReady);
  const template = useSelector((state: RootState) =>
    selectTemplateById(templateId)(state)
  );

  if (!storageReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-text-secondary text-sm">Form not found.</p>
        <Link
          href="/templates"
          className="text-sm hover:text-primary-hover underline"
        >
          Back to templates
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-6 py-3 bg-surface border-b border-border sticky top-0 z-10">
        <Link
          href="/templates"
          aria-label="FormCraft home"
          className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors"
        >
          <span className="text-primary">
            <LogoIcon />
          </span>
          <span className="text-sm font-bold hidden sm:inline">FormCraft</span>
        </Link>

        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-text-primary truncate">
            {template.title}
          </span>
        </div>

        <Link
          href="/templates"
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <XIcon />
          <span className="hidden sm:inline">Close</span>
        </Link>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-8 shadow-sm">
          <FillForm templateId={templateId} responseId={responseId} />
        </div>
      </main>
    </div>
  );
}
