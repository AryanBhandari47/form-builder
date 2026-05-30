"use client";

import * as React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import type { NumberField } from "@/entities/field";
import { updateField } from "@/store/slices/templatesSlice";
import { setDirty } from "@/store/slices/builderUiSlice";
import { BaseFieldConfig } from "./BaseFieldConfig";
import { ConfigRow } from "./ConfigRow";
import { ConfigDivider } from "./ConfigDivider";
import { ConfigSection } from "./ConfigSection";
import { ConfigInput } from "./ConfigInput";

interface NumberConfigProps {
  templateId: string;
  field: NumberField;
}

export function NumberConfig({ templateId, field }: NumberConfigProps) {
  const dispatch = useDispatch<AppDispatch>();

  function update(changes: Partial<Omit<NumberField, "id" | "type">>) {
    dispatch(updateField({ templateId, fieldId: field.id, changes }));
    dispatch(setDirty(true));
  }

  return (
    <div className="flex flex-col gap-6">
      <BaseFieldConfig
        label={field.label}
        onLabelChange={(v) => update({ label: v })}
        defaultRequired={field.defaultRequired}
        onRequiredChange={(v) => update({ defaultRequired: v })}
        defaultVisibility={field.defaultVisibility}
        onVisibilityChange={(v) => update({ defaultVisibility: v })}
      />

      <ConfigDivider />

      <ConfigSection title="Display">
        <ConfigRow label="Prefix">
          <ConfigInput
            type="text"
            value={field.prefix ?? ""}
            onChange={(e) => update({ prefix: e.target.value || undefined })}
            placeholder="e.g. $"
          />
        </ConfigRow>

        <ConfigRow label="Suffix">
          <ConfigInput
            type="text"
            value={field.suffix ?? ""}
            onChange={(e) => update({ suffix: e.target.value || undefined })}
            placeholder="e.g. kg"
          />
        </ConfigRow>

        <ConfigRow label="Decimal Places">
          <select
            value={field.decimalPlaces}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10) as 0 | 1 | 2 | 3 | 4;
              update({ decimalPlaces: v });
            }}
            className="
              w-full h-8 px-3 text-xs text-text-primary
              bg-surface border border-border rounded-sm
              focus:outline-none focus:border-primary
              transition-colors appearance-none cursor-pointer
            "
          >
            <option value={0}>0 — Integer</option>
            <option value={1}>1 — e.g. 3.1</option>
            <option value={2}>2 — e.g. 3.14</option>
            <option value={3}>3 — e.g. 3.141</option>
            <option value={4}>4 — e.g. 3.1415</option>
          </select>
        </ConfigRow>
      </ConfigSection>

      <ConfigDivider />

      <ConfigSection title="Validation">
        <ConfigRow label="Min Value">
          <ConfigInput
            type="number"
            value={field.min ?? ""}
            onChange={(e) => {
              const v =
                e.target.value === "" ? undefined : parseFloat(e.target.value);
              update({ min: v });
            }}
            placeholder="No minimum"
          />
        </ConfigRow>

        <ConfigRow label="Max Value">
          <ConfigInput
            type="number"
            value={field.max ?? ""}
            onChange={(e) => {
              const v =
                e.target.value === "" ? undefined : parseFloat(e.target.value);
              update({ max: v });
            }}
            placeholder="No maximum"
          />
        </ConfigRow>
      </ConfigSection>
    </div>
  );
}
