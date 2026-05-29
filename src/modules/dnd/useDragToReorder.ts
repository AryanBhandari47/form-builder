'use client'

import * as React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DragState {
  draggingId: string | null
  overId: string | null
}

interface UseDragToReorderOptions {
  items: string[]
  onReorder: (newOrder: string[]) => void
  containerRef: React.RefObject<HTMLElement>
}

interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void
  style: React.CSSProperties
  'data-drag-handle': string
}

interface ItemProps {
  'data-drag-id': string
  style: React.CSSProperties
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...list]
  const [removed] = result.splice(fromIndex, 1)
  if (removed !== undefined) {
    result.splice(toIndex, 0, removed)
  }
  return result
}

function getItemIdAtPoint(
  containerEl: HTMLElement,
  x: number,
  y: number
): string | null {
  const els = containerEl.querySelectorAll<HTMLElement>('[data-drag-id]')
  for (const el of Array.from(els)) {
    const rect = el.getBoundingClientRect()
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return el.getAttribute('data-drag-id')
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// useDragToReorder
// ─────────────────────────────────────────────────────────────────────────────

export function useDragToReorder({
  items,
  onReorder,
  containerRef,
}: UseDragToReorderOptions): {
  dragState: DragState
  getDragHandleProps: (id: string) => DragHandleProps
  getItemProps: (id: string) => ItemProps
} {
  const [dragState, setDragState] = React.useState<DragState>({
    draggingId: null,
    overId: null,
  })

  // Keep current items in a ref so event handlers don't capture stale closure
  const itemsRef = React.useRef<string[]>(items)
  itemsRef.current = items

  const draggingIdRef = React.useRef<string | null>(null)
  const overIdRef = React.useRef<string | null>(null)
  const rafRef = React.useRef<number | null>(null)

  const cleanup = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const handlePointerDown = React.useCallback(
    (id: string, e: React.PointerEvent) => {
      e.preventDefault()
      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)

      draggingIdRef.current = id
      overIdRef.current = id

      setDragState({ draggingId: id, overId: id })

      function handlePointerMove(moveEvent: PointerEvent) {
        if (!draggingIdRef.current) return

        const x = moveEvent.clientX
        const y = moveEvent.clientY

        if (rafRef.current !== null) return

        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          const container = containerRef.current
          if (!container) return

          const hoveredId = getItemIdAtPoint(container, x, y)
          if (hoveredId && hoveredId !== overIdRef.current) {
            overIdRef.current = hoveredId
            setDragState((prev) => ({ ...prev, overId: hoveredId }))
          }
        })
      }

      function handlePointerUp() {
        cleanup()

        const draggingId = draggingIdRef.current
        const overId = overIdRef.current
        const currentItems = itemsRef.current

        if (draggingId && overId && draggingId !== overId) {
          const fromIdx = currentItems.indexOf(draggingId)
          const toIdx = currentItems.indexOf(overId)
          if (fromIdx !== -1 && toIdx !== -1) {
            onReorder(reorder(currentItems, fromIdx, toIdx))
          }
        }

        draggingIdRef.current = null
        overIdRef.current = null
        setDragState({ draggingId: null, overId: null })

        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [containerRef, onReorder, cleanup]
  )

  // Keyboard support for accessibility
  const handleKeyDown = React.useCallback(
    (id: string, e: React.KeyboardEvent) => {
      const currentItems = itemsRef.current
      const idx = currentItems.indexOf(id)

      if (e.key === 'ArrowUp' && idx > 0) {
        e.preventDefault()
        onReorder(reorder(currentItems, idx, idx - 1))
      } else if (e.key === 'ArrowDown' && idx < currentItems.length - 1) {
        e.preventDefault()
        onReorder(reorder(currentItems, idx, idx + 1))
      }
    },
    [onReorder]
  )

  React.useEffect(() => cleanup, [cleanup])

  const getDragHandleProps = React.useCallback(
    (id: string): DragHandleProps => ({
      onPointerDown: (e: React.PointerEvent) => handlePointerDown(id, e),
      style: { touchAction: 'none', userSelect: 'none' } as React.CSSProperties,
      'data-drag-handle': id,
    }),
    [handlePointerDown]
  )

  const getItemProps = React.useCallback(
    (id: string): ItemProps => {
      const isDragging = dragState.draggingId === id
      const isOver = dragState.overId === id && dragState.draggingId !== id

      return {
        'data-drag-id': id,
        style: {
          opacity: isDragging ? 0.5 : 1,
          outline: isOver ? '2px solid var(--color-primary)' : undefined,
          outlineOffset: isOver ? '2px' : undefined,
          transition: 'opacity 0.15s ease, outline 0.1s ease',
        } as React.CSSProperties,
        onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(id, e),
      } as ItemProps
    },
    [dragState, handleKeyDown]
  )

  return { dragState, getDragHandleProps, getItemProps }
}
