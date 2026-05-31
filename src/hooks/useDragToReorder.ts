'use client'

import * as React from 'react'
import type { FieldType } from '@/entities/field'
import { useBuilderDrag } from '@/contexts/BuilderDragContext'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseDragToReorderOptions {
  items: string[]
  itemMeta: Record<string, { label: string; type: FieldType }>
  onReorder: (newOrder: string[]) => void
  containerRef: React.RefObject<HTMLElement>
}

export interface ReorderDragState {
  draggingId: string | null
  insertIndex: number | null
  /** DOMRect of the card at drag-start — used to position the full-card clone */
  cardRect: DOMRect | null
}

interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void
  style: React.CSSProperties
  'data-drag-handle': string
}

interface ItemProps {
  'data-drag-id': string
  style: React.CSSProperties
  onKeyDown: (e: React.KeyboardEvent) => void
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

function getInsertIndexAtPoint(
  containerEl: HTMLElement,
  y: number,
  draggingId: string | null
): number {
  const els = Array.from(
    containerEl.querySelectorAll<HTMLElement>('[data-drag-id]')
  ).filter((el) => el.getAttribute('data-drag-id') !== draggingId)

  if (els.length === 0) return 0

  for (let i = 0; i < els.length; i++) {
    const rect = els[i].getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    if (y < mid) return i
  }

  return els.length
}

/**
 * Compute how many pixels a non-dragged item at index `i` should shift.
 * fromIndex: original index of the dragged item
 * insertIndex: target gap (0 = before first, N = after last, in the N-1 remaining array)
 * cardHeight + gap = full height one card occupies in the list
 */
function getDisplacement(
  i: number,
  fromIndex: number,
  insertIndex: number,
  cardHeight: number,
  gap: number
): number {
  // remI: position of item i in the N-1 remaining array (after removing fromIndex)
  const remI = i < fromIndex ? i : i - 1
  // finalI: where remI ends up after the dragged card is inserted at insertIndex
  const finalI = remI < insertIndex ? remI : remI + 1
  return (finalI - i) * (cardHeight + gap)
}

// ─────────────────────────────────────────────────────────────────────────────
// useDragToReorder
// ─────────────────────────────────────────────────────────────────────────────

export function useDragToReorder({
  items,
  itemMeta,
  onReorder,
  containerRef,
}: UseDragToReorderOptions): {
  reorderDragState: ReorderDragState
  cloneRef: React.RefCallback<HTMLElement>
  getDragHandleProps: (id: string) => DragHandleProps
  getItemProps: (id: string) => ItemProps
} {
  const dragCtx = useBuilderDrag()

  const [reorderDragState, setReorderDragState] =
    React.useState<ReorderDragState>({
      draggingId: null,
      insertIndex: null,
      cardRect: null,
    })

  const itemsRef = React.useRef<string[]>(items)
  React.useEffect(() => {
    itemsRef.current = items
  })

  const draggingIdRef = React.useRef<string | null>(null)
  const fromIndexRef = React.useRef<number>(0)
  const insertIndexRef = React.useRef<number | null>(null)
  const cardHeightRef = React.useRef<number>(0)
  const offsetYRef = React.useRef<number>(0)
  const cloneElRef = React.useRef<HTMLElement | null>(null)
  const rafRef = React.useRef<number | null>(null)

  // Stable ref callback so BuilderCanvas can attach the clone div
  const cloneRef = React.useCallback((el: HTMLElement | null) => {
    cloneElRef.current = el
  }, [])

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

      // Find the card element (the ancestor with data-drag-id)
      const container = containerRef.current
      if (!container) return
      const cardEl = container.querySelector<HTMLElement>(`[data-drag-id="${id}"]`)
      if (!cardEl) return

      const cardRect = cardEl.getBoundingClientRect()
      const fromIndex = itemsRef.current.indexOf(id)

      draggingIdRef.current = id
      fromIndexRef.current = fromIndex
      insertIndexRef.current = null
      cardHeightRef.current = cardRect.height
      offsetYRef.current = e.clientY - cardRect.top

      setReorderDragState({ draggingId: id, insertIndex: null, cardRect })
      dragCtx.startReorder(
        id,
        itemMeta[id]?.type ?? 'single-line',
        itemMeta[id]?.label ?? 'Field',
        e.clientX,
        e.clientY
      )

      function handlePointerMove(moveEvent: PointerEvent) {
        if (!draggingIdRef.current) return

        // Move the clone imperatively — no React state update needed
        const clone = cloneElRef.current
        if (clone) {
          clone.style.top = `${moveEvent.clientY - offsetYRef.current}px`
        }

        if (rafRef.current !== null) return
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          const cont = containerRef.current
          if (!cont) return

          const idx = getInsertIndexAtPoint(cont, moveEvent.clientY, draggingIdRef.current)
          if (idx !== insertIndexRef.current) {
            insertIndexRef.current = idx
            setReorderDragState((prev) => ({ ...prev, insertIndex: idx }))
          }
        })
      }

      function handlePointerUp() {
        cleanup()

        const draggingId = draggingIdRef.current
        const insertIdx = insertIndexRef.current
        const currentItems = itemsRef.current

        if (draggingId !== null && insertIdx !== null) {
          const fromIdx = currentItems.indexOf(draggingId)
          if (fromIdx !== -1 && insertIdx !== fromIdx) {
            onReorder(reorder(currentItems, fromIdx, insertIdx))
          }
        }

        draggingIdRef.current = null
        insertIndexRef.current = null
        setReorderDragState({ draggingId: null, insertIndex: null, cardRect: null })
        dragCtx.endDrag()

        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerRef, onReorder, cleanup]
  )

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
      const { draggingId, insertIndex } = reorderDragState
      const isDragging = draggingId === id

      if (isDragging) {
        return {
          'data-drag-id': id,
          // invisible placeholder preserves layout space
          style: { visibility: 'hidden' } as React.CSSProperties,
          onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(id, e),
        }
      }

      if (draggingId !== null && insertIndex !== null) {
        const i = itemsRef.current.indexOf(id)
        const translateY = getDisplacement(
          i,
          fromIndexRef.current,
          insertIndex,
          cardHeightRef.current,
          8 // gap-2 = 8px
        )
        return {
          'data-drag-id': id,
          style: {
            transform: `translateY(${translateY}px)`,
            transition: 'transform 150ms ease',
            willChange: 'transform',
          } as React.CSSProperties,
          onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(id, e),
        }
      }

      return {
        'data-drag-id': id,
        style: { transition: 'transform 150ms ease' } as React.CSSProperties,
        onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(id, e),
      }
    },
    [reorderDragState, handleKeyDown]
  )

  return { reorderDragState, cloneRef, getDragHandleProps, getItemProps }
}
