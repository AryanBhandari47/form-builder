'use client'

import '@/modules/field-registry'

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectTemplateById } from '@/store/selectors/templateSelectors'
import type { RootState } from '@/store'
import { Spinner } from '@/shared/ui/Spinner'
import { FillForm } from '@/modules/form-fill/components/FillForm'

function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9h10M7 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function FillPageClient() {
  const params = useParams<{ templateId: string; responseId: string }>()
  const { templateId, responseId } = params

  const template = useSelector((state: RootState) =>
    selectTemplateById(templateId)(state)
  )

  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-text-secondary text-sm">Form not found.</p>
        <Link
          href="/templates"
          className="text-sm hover:text-primary-hover underline"
        >
          Back to templates
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-6 py-3 bg-surface border-b border-border sticky top-0 z-10">
        <Link
          href="/templates"
          aria-label="FormCraft home"
          className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors"
        >
          <span className="text-primary">
            <LogoIcon />
          </span>
          <span className="text-sm font-bold hidden sm:inline">FormCraft</span>
        </Link>

        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-text-primary truncate">
            {template.title}
          </span>
        </div>

        <Link
          href="/templates"
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <XIcon />
          <span className="hidden sm:inline">Close</span>
        </Link>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
        <div className="bg-surface rounded-[var(--radius-xl)] border border-border p-8 shadow-[var(--shadow-sm)]">
          <FillForm templateId={templateId} responseId={responseId} />
        </div>
      </main>
    </div>
  )
}
