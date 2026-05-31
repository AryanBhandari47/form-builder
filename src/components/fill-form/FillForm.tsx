"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import type { FormField } from "@/entities/field";
import type { FieldValue, FormResponse } from "@/entities/response";
import {
  selectTemplateById,
} from "@/store/selectors/templateSelectors";
import {
  initFill,
  setFieldValue,
  setFieldTouched,
  setErrors,
  setSubmitting,
  setEvaluations,
  resetFill,
} from "@/store/slices/fillSlice";
import { addResponse } from "@/store/slices/responsesSlice";
import { incrementResponseCount } from "@/store/slices/templatesSlice";
import { evaluateAll } from "@/lib/evaluator";
import { computeAllCalculations } from "@/lib/calculator";
import { getFieldEntry } from "@/lib/field-registry";
import { storageAdapter } from "@/lib/storage";
import { selectResponseById } from "@/store/selectors/responseSelectors";
import { generateId, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { FillFieldRenderer } from "./FillFieldRenderer";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface FillFormProps {
  templateId: string;
  responseId: string | "new";
}

// ─────────────────────────────────────────────────────────────────────────────
// Count visible answerable fields
// ─────────────────────────────────────────────────────────────────────────────

function getAnsweredCount(
  fieldIds: string[],
  fields: Record<string, FormField>,
  visibility: Record<string, boolean>,
  values: Record<string, FieldValue>
): { total: number; answered: number } {
  let total = 0;
  let answered = 0;
  for (const id of fieldIds) {
    const f = fields[id];
    if (!f) continue;
    if (visibility[id] === false) continue;
    if (f.type === "section-header" || f.type === "calculation") continue;
    total++;
    const v = values[id];
    if (v !== null && v !== undefined && v !== "") {
      if (Array.isArray(v) && v.length === 0) continue;
      answered++;
    }
  }
  return { total, answered };
}

// ─────────────────────────────────────────────────────────────────────────────
// FillForm
// ─────────────────────────────────────────────────────────────────────────────

export function FillForm({
  templateId,
  responseId: _responseId,
}: FillFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isViewingExisting = _responseId !== "new";

  const template = useSelector((state: RootState) =>
    selectTemplateById(templateId)(state)
  );

  // Load existing response when viewing a submitted response
  const existingResponse = useSelector((state: RootState) =>
    isViewingExisting ? selectResponseById(_responseId)(state) : null
  );

  const values = useSelector((state: RootState) => state.fill.values);
  const visibility = useSelector((state: RootState) => state.fill.visibility);
  const errors = useSelector((state: RootState) => state.fill.errors);
  const isSubmitting = useSelector(
    (state: RootState) => state.fill.isSubmitting
  );

  // Keep refs to the latest values/visibility/errors so callbacks never
  // validate against a stale Redux snapshot (classic closure timing bug).
  const valuesRef = useRef(values);
  const visibilityRef = useRef(visibility);
  const errorsRef = useRef(errors);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);
  useEffect(() => {
    visibilityRef.current = visibility;
  }, [visibility]);
  useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);

  // Initialize fill state on mount
  useEffect(() => {
    if (!template || hasInitialized) return;

    // When viewing an existing response, wait until it's loaded from storage
    if (isViewingExisting && !existingResponse) return;

    let initialValues: Record<string, FieldValue> = {};

    if (isViewingExisting && existingResponse) {
      // Pre-populate with the submitted response values
      initialValues = { ...existingResponse.values };
    } else {
      // Pre-fill date fields with today if prefillToday = true
      for (const fieldId of template.fieldIds) {
        const field = template.fields[fieldId];
        if (field?.type === "date" && field.prefillToday) {
          const today = new Date().toISOString().slice(0, 10);
          initialValues[fieldId] = today;
        }
      }
    }

    const evaluation = evaluateAll(
      template.fieldIds,
      template.fields,
      initialValues
    );

    // Run initial calculations
    const calcs = computeAllCalculations(
      template.fieldIds,
      template.fields,
      initialValues,
      evaluation.visibility
    );
    for (const [calcId, calcVal] of Object.entries(calcs)) {
      if (calcVal !== null) {
        initialValues[calcId] = calcVal;
      }
    }

    dispatch(
      initFill({
        templateId,
        initialVisibility: evaluation.visibility,
        initialRequired: evaluation.required,
        initialValues,
      })
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasInitialized(true);
  }, [
    template,
    templateId,
    dispatch,
    hasInitialized,
    isViewingExisting,
    existingResponse,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetFill());
    };
  }, [dispatch]);

  // Stable callbacks
  const handleFieldChange = useCallback(
    (fieldId: string, value: FieldValue) => {
      if (!template) return;

      dispatch(setFieldValue({ fieldId, value }));

      // Re-evaluate immediately with new value included
      const newValues = { ...values, [fieldId]: value };
      const evaluation = evaluateAll(
        template.fieldIds,
        template.fields,
        newValues
      );
      dispatch(setEvaluations(evaluation));

      // Re-compute calculations
      const calcs = computeAllCalculations(
        template.fieldIds,
        template.fields,
        newValues,
        evaluation.visibility
      );
      for (const [calcId, calcVal] of Object.entries(calcs)) {
        dispatch(setFieldValue({ fieldId: calcId, value: calcVal }));
      }
    },
    [template, values, dispatch]
  );

  const handleFieldBlur = useCallback(
    (fieldId: string) => {
      if (!template) return;
      dispatch(setFieldTouched(fieldId));

      const field = template.fields[fieldId];
      if (!field) return;

      // Read from refs to get the post-dispatch value, not the stale closure copy.
      const currentValues = valuesRef.current;
      const currentVisibility = visibilityRef.current;
      const currentErrors = errorsRef.current;

      const isRequired = currentVisibility[fieldId] !== false;
      let entry;
      try {
        entry = getFieldEntry(field.type);
      } catch {
        return;
      }
      const fieldErrors = entry.validationRules(
        field,
        currentValues[fieldId] ?? null,
        isRequired
      );
      dispatch(
        setErrors({ errors: { ...currentErrors, [fieldId]: fieldErrors } })
      );
    },
    [template, dispatch]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!template || isSubmitting) return;

      dispatch(setSubmitting(true));

      // Validate all visible+required fields
      const allErrors: Record<string, string[]> = {};
      let hasAny = false;

      for (const fieldId of template.fieldIds) {
        if (visibility[fieldId] === false) continue;
        const field = template.fields[fieldId];
        if (!field) continue;
        if (field.type === "section-header" || field.type === "calculation")
          continue;

        let entry;
        try {
          entry = getFieldEntry(field.type);
        } catch {
          continue;
        }

        const isReq =
          !!template.fields[fieldId] &&
          (field as FormField).defaultRequired === true;

        const fieldErrors = entry.validationRules(
          field,
          values[fieldId] ?? null,
          isReq
        );
        allErrors[fieldId] = fieldErrors;
        if (fieldErrors.length > 0) hasAny = true;

        // Also mark all as touched
        dispatch(setFieldTouched(fieldId));
      }

      dispatch(setErrors({ errors: allErrors }));

      if (hasAny) {
        dispatch(setSubmitting(false));
        // Scroll to first error
        setTimeout(() => {
          const errorEl = formRef.current?.querySelector(
            '[aria-invalid="true"]'
          );
          errorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        return;
      }

      // Build response
      const response: FormResponse = {
        id: generateId(),
        templateId: template.id,
        templateTitle: template.title,
        templateSnapshot: {
          fieldIds: template.fieldIds,
          fields: template.fields,
        },
        values: { ...values },
        visibilityMap: { ...visibility },
        submittedAt: new Date().toISOString(),
      };

      dispatch(addResponse(response));
      dispatch(incrementResponseCount(template.id));
      await storageAdapter.saveResponse(response);
      await storageAdapter.saveTemplate({
        ...template,
        responseCount: template.responseCount + 1,
        updatedAt: new Date().toISOString(),
      });

      dispatch(setSubmitting(false));
      setIsSuccess(true);
    },
    [template, values, visibility, isSubmitting, dispatch]
  );

  if (!template) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-sm">Template not found.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Response submitted!
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Your response to &quot;{template.title}&quot; has been recorded.
          </p>
        </div>
        <Link
          href="/templates"
          className={cn(
            "mt-2 px-6 py-2.5 rounded-sm bg-primary text-primary-light",
            "text-sm font-medium hover:bg-primary-hover transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          Back to Templates
        </Link>
      </div>
    );
  }

  // Visible field IDs (in order)
  const visibleFieldIds = template.fieldIds.filter(
    (id) => visibility[id] !== false
  );

  const { total, answered } = getAnsweredCount(
    template.fieldIds,
    template.fields,
    visibility,
    values
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {/* Form header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          {template.title}
        </h1>
        {template.description && (
          <p className="text-sm text-text-secondary mt-2">
            {template.description}
          </p>
        )}
        {isViewingExisting && existingResponse && (
          <p className="text-xs text-text-muted mt-3 bg-sidebar border border-border rounded-sm px-3 py-1.5 inline-block">
            Submitted {formatDate(existingResponse.submittedAt)} — read-only
            view
          </p>
        )}
        {!isViewingExisting && total > 0 && (
          <p className="text-xs text-text-muted mt-3">
            {answered} of {total} answered
          </p>
        )}
      </div>

      {/* Fields */}
      {visibleFieldIds.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-text-muted gap-2">
          <p className="text-sm">No fields to display.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {visibleFieldIds.map((fieldId) => (
            <FillFieldRenderer
              key={fieldId}
              fieldId={fieldId}
              templateId={templateId}
              onFieldChange={handleFieldChange}
              onFieldBlur={handleFieldBlur}
            />
          ))}
        </div>
      )}

      {/* Submit — hidden when viewing an existing response */}
      {!isViewingExisting && (
        <div className="mt-8 pt-6 border-t border-border flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full sm:w-auto sm:min-w-40 py-3 px-6 rounded-sm font-medium text-sm",
              "bg-primary text-white hover:bg-primary-hover transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Submitting…" : "Submit Response"}
          </button>
        </div>
      )}

      {/* Footer count — only for active fills */}
      {!isViewingExisting && total > 0 && (
        <p className="text-xs text-center text-text-muted mt-4">
          {answered} of {total} questions answered
        </p>
      )}
    </form>
  );
}
