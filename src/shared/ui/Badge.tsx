'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple'
  children: React.ReactNode
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant map
// ─────────────────────────────────────────────────────────────────────────────

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default:  'bg-sidebar text-text-secondary',
  success:  'bg-mint-light text-mint',
  warning:  'bg-amber-light text-amber',
  info:     'bg-primary-light text-primary',
  purple:   'bg-lavender-light text-lavender',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5',
        'text-xs font-medium rounded-full',
        'whitespace-nowrap',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
