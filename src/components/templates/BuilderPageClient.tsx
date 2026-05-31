"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Activity } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { storageAdapter } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { Button } from "@/shared/ui";
import {
  IconArrowLeft,
  IconShare,
  IconSave,
  IconCheck,
  IconPalette,
  IconSettings,
} from "@/shared/ui/Icons";

import "@/lib/field-registry";

import { FieldPalette } from "@/components/FieldPalette";
import { BuilderCanvas } from "@/components/BuilderCanvas";
import { ConfigPanel } from "@/components/ConfigPanel";
import { ResponsesPanel } from "@/components/ResponsesPanel";
import { FillForm } from "@/components/FillForm";

import { TabButton } from "./TabButton";
import { EditableTitle } from "./EditableTitle";
import { MobileDrawer } from "./MobileDrawer";
import { BuilderDragProvider } from "@/contexts/BuilderDragContext";

function BuilderPage({
  templateId: initialTemplateId,
  tab,
}: {
  templateId: string;
  tab?: string;
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const rawTemplateId = initialTemplateId;
  const isNew = rawTemplateId === "new";

  const newTemplateIdRef = useRef<string>(isNew ? generateId() : "");

  const [templateId, setTemplateId] = useState<string>(
    isNew ? "" : rawTemplateId
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<"palette" | "config" | null>(
    null
  );

  const activeTab = useSelector(
    (state: RootState) => state.builderUi.activeTab
  );
  const isDirty = useSelector((state: RootState) => state.builderUi.isDirty);

  const initialTabFromUrl = (tab as BuilderTab | null) ?? "build";

  useEffect(() => {
    dispatch(setActiveTab(initialTabFromUrl));
  }, [dispatch, initialTabFromUrl]);

  const template = useSelector((state: RootState) =>
    templateId ? selectTemplateById(templateId)(state) : null
  );

  const title = template?.title ?? "Untitled Form";

  useEffect(() => {
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
  }, [isNew, dispatch, router]);

  function handleTitleChange(newTitle: string) {
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
      await storageAdapter.saveTemplate(template);
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
      {/* Header */}
      <header className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-surface border-b border-border shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Link
            href="/templates"
            aria-label="Back to templates"
            className="flex items-center justify-center w-8 h-8 rounded-sm text-text-secondary hover:bg-sidebar hover:text-text-primary transition-colors shrink-0"
          >
            <IconArrowLeft />
          </Link>
          <EditableTitle value={title} onChange={handleTitleChange} />
          {isDirty && (
            <span className="text-[10px] text-text-muted shrink-0 ml-1">
              • Unsaved
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-0.5 sm:gap-1 mx-auto overflow-x-auto scrollbar-none"
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

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<IconShare />}
            disabled
            title="Sharing coming soon"
            className="hidden lg:flex"
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
            <span className="hidden sm:inline">
              {savedRecently ? "Saved!" : "Save"}
            </span>
            <span className="sm:hidden">{savedRecently ? "✓" : "Save"}</span>
          </Button>

          <Link href={`/fill/${templateId}/new`}>
            <Button variant="primary" size="sm">
              <span className="hidden sm:inline">New Response</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <BuilderDragProvider>
      <div className="flex-1 flex overflow-hidden relative h-0">
        {/* Build tab */}
        <Activity mode={activeTab === "build" ? "visible" : "hidden"}>
          <div className="flex-1 flex overflow-hidden flex-col h-full">
            {/* Desktop: 3-panel layout */}
            <div className="hidden md:flex flex-1 overflow-hidden">
              <div className="w-60 shrink-0 overflow-hidden">
                <FieldPalette templateId={templateId} />
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <BuilderCanvas templateId={templateId} />
              </div>
              <div className="w-80 shrink-0 overflow-hidden">
                <ConfigPanel templateId={templateId} />
              </div>
            </div>

            {/* Mobile: canvas only with floating buttons */}
            <div className="flex md:hidden flex-1 overflow-hidden flex-col">
              <div className="flex-1 overflow-hidden flex flex-col">
                <BuilderCanvas templateId={templateId} />
              </div>
              <div className="flex items-center justify-center gap-3 py-2 border-t border-border bg-surface shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileDrawer("palette")}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-secondary hover:bg-primary-light rounded-sm transition-colors"
                >
                  <IconPalette />
                  Fields
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawer("config")}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-secondary hover:bg-primary-light rounded-sm transition-colors"
                >
                  <IconSettings />
                  Config
                </button>
              </div>
            </div>
          </div>
        </Activity>

        {/* Mobile drawers for Build tab */}
        <MobileDrawer
          open={mobileDrawer === "palette"}
          onClose={() => setMobileDrawer(null)}
          title="Add Field"
        >
          <FieldPalette templateId={templateId} />
        </MobileDrawer>
        <MobileDrawer
          open={mobileDrawer === "config"}
          onClose={() => setMobileDrawer(null)}
          title="Field Config"
        >
          <ConfigPanel templateId={templateId} />
        </MobileDrawer>

        {/* Preview tab */}
        <Activity mode={activeTab === "preview" ? "visible" : "hidden"}>
          <div className="flex-1 overflow-y-auto bg-canvas h-full">
            <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
              <div className="bg-surface rounded-xl border border-border p-4 sm:p-8 shadow-sm">
                <FillForm
                  key={`preview-${templateId}`}
                  templateId={templateId}
                  responseId="new"
                />
              </div>
            </div>
          </div>
        </Activity>

        {/* Responses tab */}
        <Activity mode={activeTab === "responses" ? "visible" : "hidden"}>
          <div className="flex-1 h-full">
            <ResponsesPanel templateId={templateId} />
          </div>
        </Activity>
      </div>
      </BuilderDragProvider>
    </div>
  );
}

export default function BuilderPageClient({
  templateId,
  tab,
}: {
  templateId: string;
  tab?: string;
}) {
  return (
    <Suspense>
      <BuilderPage templateId={templateId} tab={tab} />
    </Suspense>
  );
}
