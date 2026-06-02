"use client";

import { memo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { FieldValue } from "@/entities/response";
import { selectTemplateFieldMap } from "@/store/selectors/templateSelectors";
import { SingleLineFillField } from "../fill-fields/SingleLineFillField";
import { MultiLineFillField } from "../fill-fields/MultiLineFillField";
import { NumberFillField } from "../fill-fields/NumberFillField";
import { DateFillField } from "../fill-fields/DateFillField";
import { SingleSelectFillField } from "../fill-fields/SingleSelectFillField";
import { MultiSelectFillField } from "../fill-fields/MultiSelectFillField";
import { FileUploadFillField } from "../fill-fields/FileUploadFillField";
import { SectionHeaderFillField } from "../fill-fields/SectionHeaderFillField";
import { CalculationFillField } from "../fill-fields/CalculationFillField";

interface FillFieldRendererProps {
  fieldId: string;
  templateId: string;
  onFieldChange: (fieldId: string, value: FieldValue) => void;
  onFieldBlur: (fieldId: string) => void;
}

export const FillFieldRenderer = memo(function FillFieldRenderer({
  fieldId,
  templateId,
  onFieldChange,
  onFieldBlur,
}: FillFieldRendererProps) {
  const fieldMap = useSelector((state: RootState) =>
    selectTemplateFieldMap(templateId)(state)
  );
  const field = fieldMap[fieldId];
  const value = useSelector(
    (state: RootState) => state.fill.values[fieldId] ?? null
  );
  const isRequired = useSelector(
    (state: RootState) => state.fill.required[fieldId] ?? false
  );
  const errors = useSelector((state: RootState) => state.fill.errors[fieldId]);
  const touched = useSelector(
    (state: RootState) => state.fill.touched[fieldId] ?? false
  );

  if (!field) return null;

  const shownErrors = touched ? errors : undefined;

  const commonProps = {
    value,
    onChange: (val: FieldValue) => onFieldChange(fieldId, val),
    onBlur: () => onFieldBlur(fieldId),
    error: shownErrors,
    isRequired,
  };

  switch (field.type) {
    case "single-line":
      return <SingleLineFillField field={field} {...commonProps} />;
    case "multi-line":
      return <MultiLineFillField field={field} {...commonProps} />;
    case "number":
      return <NumberFillField field={field} {...commonProps} />;
    case "date":
      return <DateFillField field={field} {...commonProps} />;
    case "single-select":
      return <SingleSelectFillField field={field} {...commonProps} />;
    case "multi-select":
      return <MultiSelectFillField field={field} {...commonProps} />;
    case "file-upload":
      return <FileUploadFillField field={field} {...commonProps} />;
    case "section-header":
      return <SectionHeaderFillField field={field} {...commonProps} />;
    case "calculation":
      return (
        <CalculationFillField
          field={field}
          {...commonProps}
          allFields={fieldMap}
        />
      );
    case "rating":
      return 
    default: {
      const _exhaustive: never = field;
      void _exhaustive;
      return null;
    }
  }
});
