"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { FormField } from "@/entities/field";
import { selectTemplateFields } from "@/store/selectors/templateSelectors";
import { cn } from "@/lib/utils";
import { FieldIcon } from "./FieldIcon";
import { ConditionsBuilder } from "./ConditionsBuilder";
import { SingleLineConfig } from "./config/SingleLineConfig";
import { MultiLineConfig } from "./config/MultiLineConfig";
import { NumberConfig } from "./config/NumberConfig";
import { DateConfig } from "./config/DateConfig";
import { SingleSelectConfig } from "./config/SingleSelectConfig";
import { MultiSelectConfig } from "./config/MultiSelectConfig";
import { FileUploadConfig } from "./config/FileUploadConfig";
import { SectionHeaderConfig } from "./config/SectionHeaderConfig";
import { CalculationConfig } from "./config/CalculationConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Field type → friendly name
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<FormField["type"], string> = {
  "single-line": "Single Line Text",
  "multi-line": "Multi Line Text",
  number: "Number",
  date: "Date",
  "single-select": "Single Select",
  "multi-select": "Multi Select",
  "file-upload": "File Upload",
  "section-header": "Section Header",
  calculation: "Calculation",
};

// ─────────────────────────────────────────────────────────────────────────────
// FieldConfigForm — dispatcher
// ─────────────────────────────────────────────────────────────────────────────

function FieldConfigForm({
  templateId,
  field,
}: {
  templateId: string;
  field: FormField;
}) {
  switch (field.type) {
    case "single-line":
      return <SingleLineConfig templateId={templateId} field={field} />;
    case "multi-line":
      return <MultiLineConfig templateId={templateId} field={field} />;
    case "number":
      return <NumberConfig templateId={templateId} field={field} />;
    case "date":
      return <DateConfig templateId={templateId} field={field} />;
    case "single-select":
      return <SingleSelectConfig templateId={templateId} field={field} />;
    case "multi-select":
      return <MultiSelectConfig templateId={templateId} field={field} />;
    case "file-upload":
      return <FileUploadConfig templateId={templateId} field={field} />;
    case "section-header":
      return <SectionHeaderConfig templateId={templateId} field={field} />;
    case "calculation":
      return <CalculationConfig templateId={templateId} field={field} />;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab type
// ─────────────────────────────────────────────────────────────────────────────

type ConfigTab = "general" | "conditions";

// ─────────────────────────────────────────────────────────────────────────────
// ConfigPanel
// ─────────────────────────────────────────────────────────────────────────────

interface ConfigPanelProps {
  templateId: string;
}

export function ConfigPanel({ templateId }: ConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>("general");

  const selectedFieldId = useSelector(
    (state: RootState) => state.builderUi.selectedFieldId
  );

  const allFields = useSelector(
    (state: RootState) => selectTemplateFields(templateId)(state) ?? []
  );

  const selectedField = allFields.find((f) => f.id === selectedFieldId) ?? null;

  // Reset tab to general when field changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab("general");
  }, [selectedFieldId]);

  if (!selectedField) {
    return (
      <aside
        className="flex flex-col h-full bg-surface border-l border-border overflow-hidden"
        aria-label="Field configuration"
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 rounded-lg bg-sidebar border border-border flex items-center justify-center mb-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-text-muted"
            >
              <path
                d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            No field selected
          </h3>
          <p className="text-xs text-text-muted">
            Click a field in the canvas to configure it.
          </p>
        </div>
      </aside>
    );
  }

  const conditionCount = selectedField.conditions.length;

  return (
    <aside
      className="flex flex-col h-full bg-surface border-l border-border overflow-hidden"
      aria-label="Field configuration"
    >
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-0 border-b border-border">
        {/* Field type indicator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary">
            <FieldIcon type={selectedField.type} className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-text-primary">
            {TYPE_LABEL[selectedField.type]}
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-0" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            className={cn(
              "px-3 py-2 text-xs font-medium border-b-2 transition-colors",
              activeTab === "general"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            General
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "conditions"}
            onClick={() => setActiveTab("conditions")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors",
              activeTab === "conditions"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            Conditions
            {conditionCount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold",
                  activeTab === "conditions"
                    ? "bg-primary text-white"
                    : "bg-border text-text-secondary"
                )}
              >
                {conditionCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "general" && (
          <FieldConfigForm templateId={templateId} field={selectedField} />
        )}
        {activeTab === "conditions" && (
          <ConditionsBuilder
            templateId={templateId}
            fieldId={selectedField.id}
          />
        )}
      </div>
    </aside>
  );
}
