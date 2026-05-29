'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'px-6 py-16 gap-4',
        className
      )}
    >
      {icon && (
        <div className="flex items-center justify-center w-14 h-14 rounded-[var(--radius-lg)] bg-sidebar text-text-muted">
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {description && (
          <p className="text-sm text-text-muted">{description}</p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
