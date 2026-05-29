"use client";

import * as React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { FormResponse } from "@/entities/response";
import { selectResponsesByTemplateId } from "@/store/selectors/responseSelectors";
import { formatDate, getFirstTextValue, getCompletionPercentage } from "@/lib/utils";
import { Badge } from "@/shared/ui";
import Link from "next/link";
import { StatCard } from "./StatCard";

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 2v8M5 7l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 12h11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ResponsesPanel
// ─────────────────────────────────────────────────────────────────────────────

interface ResponsesPanelProps {
  templateId: string;
}

export function ResponsesPanel({ templateId }: ResponsesPanelProps) {
  const responses = useSelector((state: RootState) =>
    selectResponsesByTemplateId(templateId)(state)
  );

  const totalResponses = responses.length;

  // Compute average completion rate
  const avgCompletion =
    totalResponses > 0
      ? Math.round(
          responses.reduce((acc, r) => acc + getCompletionPercentage(r), 0) /
            totalResponses
        )
      : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-canvas">
      {/* Inner scroll container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Responses"
              value={totalResponses}
              sub={
                totalResponses === 1
                  ? "1 submission"
                  : `${totalResponses} submissions`
              }
            />
            <StatCard
              label="Page Views"
              value="—"
              sub="Analytics coming soon"
            />
            <StatCard label="Avg. Rating" value="—" sub="No rating fields" />
            <StatCard
              label="Completion Rate"
              value={totalResponses > 0 ? `${avgCompletion}%` : "—"}
              sub={
                totalResponses > 0
                  ? "of visible fields filled"
                  : "No responses yet"
              }
            />
          </div>

          {/* Responses table */}
          {totalResponses === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface border border-border rounded-[var(--radius-lg)]">
              <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-sidebar border border-border flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="text-text-muted"
                >
                  <path
                    d="M9 12h6M9 16h4M5 20h14a2 2 0 002-2V8l-6-6H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 2v6h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                No responses yet
              </h3>
              <p className="text-xs text-text-muted mb-4 max-w-xs">
                Share your form to start collecting responses. They&apos;ll
                appear here once submitted.
              </p>
              <Link
                href={`/fill/${templateId}/new`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-medium rounded-sm hover:bg-primary-hover transition-colors"
              >
                Preview form
              </Link>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-x-auto">
              {/* Table — min-width ensures Actions column is never squeezed */}
              <div className="min-w-[640px]">
                {/* Table header */}
                <div className="grid grid-cols-[minmax(140px,1fr)_minmax(140px,1.5fr)_minmax(120px,1fr)_80px_152px] gap-0 border-b border-border">
                  {[
                    "Submitted",
                    "Name / First Response",
                    "Completion",
                    "Status",
                    "Actions",
                  ].map((col) => (
                    <div
                      key={col}
                      className="px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider"
                    >
                      {col}
                    </div>
                  ))}
                </div>

                {/* Table rows */}
                {responses.map((response) => {
                  const completion = getCompletionPercentage(response);
                  const firstName = getFirstTextValue(response);

                  return (
                    <div
                      key={response.id}
                      className="grid grid-cols-[minmax(140px,1fr)_minmax(140px,1.5fr)_minmax(120px,1fr)_80px_152px] gap-0 border-b border-border last:border-0 hover:bg-sidebar/50 transition-colors"
                    >
                      {/* Submitted */}
                      <div className="px-4 py-3 flex flex-col justify-center">
                        <span className="text-xs text-text-primary font-medium">
                          {formatDate(response.submittedAt)}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="px-4 py-3 flex items-center min-w-0">
                        <span className="text-xs text-text-primary truncate">
                          {firstName}
                        </span>
                      </div>

                      {/* Completion */}
                      <div className="px-4 py-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-sidebar rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-muted w-8 flex-shrink-0">
                          {completion}%
                        </span>
                      </div>

                      {/* Status */}
                      <div className="px-4 py-3 flex items-center">
                        <Badge variant="success">Submitted</Badge>
                      </div>

                      {/* Actions */}
                      <div className="px-4 py-3 flex items-center gap-2">
                        <Link
                          href={`/fill/${templateId}/${response.id}`}
                          title="View response"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-text-secondary hover:text-primary hover:bg-primary-light rounded transition-colors border border-border hover:border-primary whitespace-nowrap"
                        >
                          <EyeIcon />
                          View
                        </Link>
                        <Link
                          href={`/print/${response.id}`}
                          title="Download PDF"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-text-secondary hover:text-primary hover:bg-primary-light rounded transition-colors border border-border hover:border-primary whitespace-nowrap"
                        >
                          <DownloadIcon />
                          PDF
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
