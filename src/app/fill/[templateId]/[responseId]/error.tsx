'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function FillError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[FillPage error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background px-6 text-center">
      <p className="text-text-secondary text-sm font-medium">Something went wrong loading this form.</p>
      <p className="text-xs text-text-muted font-mono bg-sidebar border border-border rounded px-3 py-2 max-w-md break-all">
        {error.message}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-white text-sm rounded-sm hover:bg-primary-hover transition-colors"
        >
          Try again
        </button>
        <Link
          href="/templates"
          className="px-4 py-2 border border-border text-sm rounded-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Back to templates
        </Link>
      </div>
    </div>
  )
}
