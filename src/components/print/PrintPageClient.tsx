'use client'

import '@/lib/field-registry'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { selectResponseById } from '@/store/selectors/responseSelectors'
import { formatDate } from '@/lib/utils'
import { PrintFieldRow } from './PrintFieldRow'

export default function PrintPageClient({
  responseId,
}: {
  responseId: string;
}) {
  const storageReady = useSelector((state: RootState) => state.app.storageReady)
  const response = useSelector((state: RootState) =>
    selectResponseById(responseId)(state)
  )

  useEffect(() => {
    if (!storageReady || !response) return
    const timer = setTimeout(() => {
      window.print()
    }, 600)
    return () => clearTimeout(timer)
  }, [storageReady, response])

  return (
    <div>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          @page { margin: 2cm; size: A4; }
        }
      `}</style>

      {/* Screen-only toolbar */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500 truncate mr-4 min-w-0">
          {response
            ? `${response.templateTitle} — ${formatDate(response.submittedAt)}`
            : `Response #${responseId.slice(0, 8)}`}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/templates" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            Close
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm font-medium px-4 py-1.5 rounded-md bg-[#5B7FEF] text-white hover:bg-[#4A6EDE] transition-colors"
          >
            Save as PDF
          </button>
        </div>
      </div>

      {/* Document content — no extra wrappers, page margins handle spacing */}
      <main className="max-w-2xl mx-auto px-8 py-10">
        {!storageReady ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-6 h-6 rounded-full border-2 border-[#5B7FEF] border-t-transparent animate-spin" />
          </div>
        ) : !response ? (
          <div className="text-center py-32 text-gray-400">
            <p className="text-sm font-medium">Response not found</p>
            <p className="text-xs mt-1 text-gray-300">ID: {responseId}</p>
          </div>
        ) : (
          <>
            {/* Accent bar */}
            <div className="h-1 w-12 rounded-full bg-[#5B7FEF] mb-6" />

            {/* Header */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5B7FEF] mb-2">
                Form Response
              </p>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {response.templateTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3">
                <span className="text-xs text-gray-400">
                  Submitted {formatDate(response.submittedAt)}
                </span>
                <span className="text-xs text-gray-300">
                  ID: {response.id.slice(0, 12)}…
                </span>
              </div>
            </div>

            {/* Fields */}
            <dl>
              {response.templateSnapshot.fieldIds
                .filter((fieldId) => response.visibilityMap[fieldId] !== false)
                .map((fieldId) => {
                  const field = response.templateSnapshot.fields[fieldId]
                  if (!field) return null
                  const value = response.values[fieldId] ?? null
                  return (
                    <PrintFieldRow key={fieldId} field={field} value={value} />
                  )
                })}
            </dl>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-gray-300">
                FORMCRAFT
              </span>
              <span className="text-[10px] text-gray-300">
                {formatDate(response.submittedAt)}
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
