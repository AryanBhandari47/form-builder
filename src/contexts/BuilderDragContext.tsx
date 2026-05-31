'use client'

import * as React from 'react'
import type { FieldType } from '@/entities/field'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DragMode = 'reorder' | 'add' | null

export interface BuilderDragState {
  mode: DragMode
  ghostX: number
  ghostY: number
  ghostLabel: string
  ghostFieldType: FieldType | null
  draggingId: string | null
  addFieldType: FieldType | null
}

interface BuilderDragContextValue {
  dragState: BuilderDragState
  startReorder: (id: string, fieldType: FieldType, label: string, x: number, y: number) => void
  startAdd: (type: FieldType, label: string, x: number, y: number) => void
  updateGhost: (x: number, y: number) => void
  endDrag: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const BuilderDragContext = React.createContext<BuilderDragContextValue | null>(null)

export function useBuilderDrag(): BuilderDragContextValue {
  const ctx = React.useContext(BuilderDragContext)
  if (!ctx) throw new Error('useBuilderDrag must be used inside BuilderDragProvider')
  return ctx
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

const IDLE: BuilderDragState = {
  mode: null,
  ghostX: 0,
  ghostY: 0,
  ghostLabel: '',
  ghostFieldType: null,
  draggingId: null,
  addFieldType: null,
}

export function BuilderDragProvider({ children }: { children: React.ReactNode }) {
  const [dragState, setDragState] = React.useState<BuilderDragState>(IDLE)

  const startReorder = React.useCallback(
    (id: string, fieldType: FieldType, label: string, x: number, y: number) => {
      setDragState({
        mode: 'reorder',
        ghostX: x,
        ghostY: y,
        ghostLabel: label,
        ghostFieldType: fieldType,
        draggingId: id,
        addFieldType: null,
      })
    },
    []
  )

  const startAdd = React.useCallback(
    (type: FieldType, label: string, x: number, y: number) => {
      setDragState({
        mode: 'add',
        ghostX: x,
        ghostY: y,
        ghostLabel: label,
        ghostFieldType: type,
        draggingId: null,
        addFieldType: type,
      })
    },
    []
  )

  const updateGhost = React.useCallback((x: number, y: number) => {
    setDragState((prev) =>
      prev.mode === null ? prev : { ...prev, ghostX: x, ghostY: y }
    )
  }, [])

  const endDrag = React.useCallback(() => {
    setDragState(IDLE)
  }, [])

  const value = React.useMemo(
    () => ({ dragState, startReorder, startAdd, updateGhost, endDrag }),
    [dragState, startReorder, startAdd, updateGhost, endDrag]
  )

  return (
    <BuilderDragContext.Provider value={value}>
      {children}
    </BuilderDragContext.Provider>
  )
}
