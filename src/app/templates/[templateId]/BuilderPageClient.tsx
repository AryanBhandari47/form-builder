"use client";

import * as React from "react";
import { Activity } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { selectTemplateById } from "@/store/selectors/templateSelectors";
import {
  setSelectedField,
  setDirty,
  setActiveTab,
  resetBuilderUi,
} from "@/store/slices/builderUiSlice";
import type { BuilderTab } from "@/store/slices/builderUiSlice";
import {
  upsertTemplate,
  updateTemplateTitle,
} from "@/store/slices/templatesSlice";
import { localStorageAdapter } from "@/modules/storage/localStorage.adapter";
import { generateId, cn } from "@/lib/utils";
import { Button } from "@/shared/ui";

import "@/modules/field-registry";

import { FieldPalette } from "@/modules/form-builder/components/FieldPalette";
import { BuilderCanvas } from "@/modules/form-builder/components/BuilderCanvas";
import { ConfigPanel } from "@/modules/form-builder/components/ConfigPanel";
import { ResponsesPanel } from "@/modules/form-builder/components/ResponsesPanel";
import { FillForm } from "@/modules/form-fill/components/FillForm";

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 7.2l7-3.2M4.5 8.8l7 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13 13.5H3a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5h8l2.5 2.5V13a.5.5 0 01-.5.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 13.5V9.5a.5.5 0 00-.5-.5H6a.5.5 0 00-.5.5v4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path d="M5.5 2.5v3H10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-sm transition-colors",
        active
          ? "bg-primary-light text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-sidebar"
      )}
    >
      {children}
    </button>
  );
}

function EditableTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        autoFocus
        className="
          text-sm font-semibold text-text-primary bg-transparent
          border-b border-primary outline-none
          min-w-[120px] max-w-[280px] px-0.5
        "
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="Click to edit"
      className="
        text-sm font-semibold text-text-primary
        hover:text-primary transition-colors
        max-w-[280px] truncate cursor-pointer
      "
    >
      {value}
    </button>
  );
}

function BuilderPage() {
  const params = useParams<{ templateId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const rawTemplateId = params.templateId;
  const isNew = rawTemplateId === "new";

  const newTemplateIdRef = React.useRef<string>(isNew ? generateId() : "");

  const [templateId, setTemplateId] = React.useState<string>(
    isNew ? "" : rawTemplateId
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [savedRecently, setSavedRecently] = React.useState(false);

  const activeTab = useSelector(
    (state: RootState) => state.builderUi.activeTab
  );
  const isDirty = useSelector((state: RootState) => state.builderUi.isDirty);

  const initialTabFromUrl =
    (searchParams.get("tab") as BuilderTab | null) ?? "build";

  React.useEffect(() => {
    dispatch(setActiveTab(initialTabFromUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const template = useSelector((state: RootState) =>
    templateId ? selectTemplateById(templateId)(state) : null
  );

  const [title, setTitle] = React.useState(
    isNew ? "Untitled Form" : template?.title ?? "Untitled Form"
  );

  React.useEffect(() => {
    if (isNew) {
      const newId = newTemplateIdRef.current;
      const now = new Date().toISOString();
      const newTemplate = {
        id: newId,
        title: "Untitled Form",
        fieldIds: [],
        fields: {},
        createdAt: now,
        updatedAt: now,
        responseCount: 0,
      };
      dispatch(upsertTemplate(newTemplate));
      setTemplateId(newId);
      router.replace(`/templates/${newId}?tab=build`, { scroll: false });
    }
    return () => {
      dispatch(resetBuilderUi());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (template?.title) {
      setTitle(template.title);
    }
  }, [template?.title]);

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (templateId) {
      dispatch(updateTemplateTitle({ id: templateId, title: newTitle }));
      dispatch(setDirty(true));
    }
  }

  function handleTabChange(tab: BuilderTab) {
    dispatch(setActiveTab(tab));
    if (tab !== "build") {
      dispatch(setSelectedField(null));
    }
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  async function handleSave() {
    if (!templateId || !template) return;
    setIsSaving(true);
    try {
      await localStorageAdapter.saveTemplate(template);
      dispatch(setDirty(false));
      setSavedRecently(true);
      setTimeout(() => setSavedRecently(false), 2500);
    } catch (err) {
      console.error("[BuilderPage] Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }

  if (!templateId) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-canvas items-center justify-center">
        <div className="text-sm text-text-muted">Creating form…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-canvas">
      <header className="flex items-center gap-4 px-4 py-3 bg-surface border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/templates"
            aria-label="Back to templates"
            className="flex items-center justify-center w-8 h-8 rounded-sm text-text-secondary hover:bg-sidebar hover:text-text-primary transition-colors flex-shrink-0"
          >
            <IconArrowLeft />
          </Link>
          <EditableTitle value={title} onChange={handleTitleChange} />
          {isDirty && (
            <span className="text-[10px] text-text-muted flex-shrink-0 ml-1">
              • Unsaved
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-1 mx-auto"
          role="tablist"
          aria-label="Builder mode"
        >
          <TabButton
            active={activeTab === "build"}
            onClick={() => handleTabChange("build")}
          >
            Build
          </TabButton>
          <TabButton
            active={activeTab === "preview"}
            onClick={() => handleTabChange("preview")}
          >
            Preview
          </TabButton>
          <TabButton
            active={activeTab === "responses"}
            onClick={() => handleTabChange("responses")}
          >
            Responses
          </TabButton>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<IconShare />}
            disabled
            title="Sharing coming soon"
          >
            Share
          </Button>

          <Button
            variant={
              savedRecently ? "secondary" : isDirty ? "primary" : "secondary"
            }
            size="sm"
            leftIcon={savedRecently ? <IconCheck /> : <IconSave />}
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving || (!isDirty && !savedRecently)}
            title="Save to browser"
          >
            {savedRecently ? "Saved!" : "Save"}
          </Button>

          <Link href={`/fill/${templateId}/new`}>
            <Button variant="primary" size="sm">
              New Response
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Activity mode={activeTab === "build" ? "visible" : "hidden"}>
          <div className="flex-1 flex overflow-hidden">
            <div className="w-60 flex-shrink-0 overflow-hidden">
              <FieldPalette templateId={templateId} />
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <BuilderCanvas templateId={templateId} />
            </div>

            <div className="w-80 flex-shrink-0 overflow-hidden">
              <ConfigPanel templateId={templateId} />
            </div>
          </div>
        </Activity>

        <Activity mode={activeTab === "preview" ? "visible" : "hidden"}>
          <div className="flex-1 overflow-y-auto bg-canvas">
            <div className="max-w-2xl w-full mx-auto px-6 py-10">
              <div className="bg-surface rounded-[var(--radius-xl)] border border-border p-8 shadow-[var(--shadow-sm)]">
                <FillForm
                  key={`preview-${templateId}`}
                  templateId={templateId}
                  responseId="new"
                />
              </div>
            </div>
          </div>
        </Activity>

        <Activity mode={activeTab === "responses" ? "visible" : "hidden"}>
          <ResponsesPanel templateId={templateId} />
        </Activity>
      </div>
    </div>
  );
}

export default function BuilderPageClient() {
  return (
    <React.Suspense>
      <BuilderPage />
    </React.Suspense>
  );
}
