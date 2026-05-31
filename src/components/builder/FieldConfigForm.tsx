"use client";

import type { FormField } from "@/entities/field";
import { SingleLineConfig } from "../config/SingleLineConfig";
import { MultiLineConfig } from "../config/MultiLineConfig";
import { NumberConfig } from "../config/NumberConfig";
import { DateConfig } from "../config/DateConfig";
import { SingleSelectConfig } from "../config/SingleSelectConfig";
import { MultiSelectConfig } from "../config/MultiSelectConfig";
import { FileUploadConfig } from "../config/FileUploadConfig";
import { SectionHeaderConfig } from "../config/SectionHeaderConfig";
import { CalculationConfig } from "../config/CalculationConfig";

interface FieldConfigFormProps {
  templateId: string;
  field: FormField;
}

export function FieldConfigForm({ templateId, field }: FieldConfigFormProps) {
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
