'use client'

import * as React from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'

import { cn } from '@/lib/utils'
import { SortableItem } from '@/components/sortable/sortable-item'
import { useMounted } from '@/components/inspector/use-mounted'
import { GripVertical } from 'lucide-react'

type SortableListProps<T extends { id: string }> = {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  disabled?: boolean
}

function SortableListShell({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <ul data-slot="sortable-list" className={cn('flex flex-col gap-2', className)}>
      {children}
    </ul>
  )
}

/** Static row used for SSR / pre-hydration so dnd-kit a11y ids don’t mismatch. */
function SortableItemPlaceholder({
  children,
  disabled,
}: {
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <div data-slot="sortable-item" className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Drag to reorder"
        disabled
        className={cn(
          'text-muted-foreground shrink-0 cursor-grab touch-none opacity-50',
          disabled && 'pointer-events-none'
        )}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
  disabled = false,
}: SortableListProps<T>) {
  // @dnd-kit uses a module-level a11y id counter (DndDescribedBy-N) that drifts
  // between SSR and the client — mount the DnD tree only after hydration.
  const mounted = useMounted()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    // No drop target, drop on self, or item not found — all are no-ops
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  if (!mounted) {
    return (
      <SortableListShell className={className}>
        {items.map((item, index) => (
          <li key={item.id}>
            <SortableItemPlaceholder disabled={disabled}>
              {renderItem(item, index)}
            </SortableItemPlaceholder>
          </li>
        ))}
      </SortableListShell>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <SortableListShell className={className}>
          {items.map((item, index) => (
            <li key={item.id}>
              <SortableItem id={item.id} disabled={disabled}>
                {renderItem(item, index)}
              </SortableItem>
            </li>
          ))}
        </SortableListShell>
      </SortableContext>
    </DndContext>
  )
}

export { SortableList }
export type { SortableListProps }
