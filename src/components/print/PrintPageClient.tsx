'use client'

import '@/lib/field-registry'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import type { FormField, SectionHeaderField, CalculationField } from '@/entities/field'
import type { FileMetadata, FieldValue } from '@/entities/response'
import { selectResponseById } from '@/store/selectors/responseSelectors'
import { getFieldEntry } from '@/lib/field-registry'
import { formatDate, cn } from '@/lib/utils'

const SECTION_SIZE_CLASS: Record<SectionHeaderField['size'], string> = {
  xs: 'text-sm font-semibold',
  sm: 'text-base font-semibold',
  md: 'text-lg font-semibold',
  lg: 'text-xl font-bold',
  xl: 'text-2xl font-bold',
}

function PrintFieldRow({ field, value }: { field: FormField; value: FieldValue }) {
  if (field.type === 'section-header') {
    const sizeClass = SECTION_SIZE_CLASS[field.size] ?? 'text-base font-semibold'
    return (
      <div className="mt-6 mb-2">
        <h2 className={cn('text-gray-800', sizeClass)}>{field.label}</h2>
        <hr className="border-gray-200 mt-1" />
      </div>
    )
  }

  let displayValue: string = '—'

  if (field.type === 'file-upload') {
    const files = Array.isArray(value) ? (value as FileMetadata[]) : []
    if (files.length > 0) {
      const fileNames = files.map((f) => f.name).join(', ')
      displayValue = `${files.length} file${files.length !== 1 ? 's' : ''} attached: ${fileNames}`
    }
  } else if (field.type === 'calculation') {
    const calcField = field as CalculationField
    displayValue =
      typeof value === 'number'
        ? value.toFixed(calcField.decimalPlaces)
        : '—'
  } else {
    try {
      const entry = getFieldEntry(field.type)
      displayValue = entry.pdfFormatter(field, value)
    } catch {
      displayValue = value !== null && value !== undefined ? String(value) : '—'
    }
  }

  const isCalculation = field.type === 'calculation'

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {field.label}
        {isCalculation && (
          <span className="ml-2 text-[10px] font-normal normal-case text-gray-400">
            (calculated)
          </span>
        )}
      </dt>
      <dd className={cn(
        'text-sm text-gray-800 break-words',
        displayValue === '—' && 'text-gray-400 italic'
      )}>
        {displayValue}
      </dd>
    </div>
  )
}

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
    <div className="print-container">
      <style>{`
        @media print {
          body { background: #fff !important; font-size: 12pt; }
          .no-print { display: none !important; }
          @page { margin: 2cm; }
        }
      `}</style>

      <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <p className="text-sm text-gray-600 truncate mr-4 min-w-0">
          {response
            ? `${response.templateTitle} — Submitted ${formatDate(response.submittedAt)}`
            : `Response #${responseId.slice(0, 8)}`}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Close
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {!storageReady ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : !response ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-sm font-medium">Response not found</p>
            <p className="text-xs mt-1">ID: {responseId}</p>
          </div>
        ) : (
          <>
            <div className="mb-8 pb-6 border-b-2 border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900">
                {response.templateTitle}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Submitted: {formatDate(response.submittedAt)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Response ID: {response.id}
              </p>
            </div>

            <dl className="flex flex-col">
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

            <div className="mt-10 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center no-print">
              Generated by FormCraft
            </div>
          </>
        )}
      </main>
    </div>
  )
}
