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

type SortableListProps<T extends { id: string }> = {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  disabled?: boolean
}

function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
  disabled = false,
}: SortableListProps<T>) {
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul data-slot="sortable-list" className={cn('flex flex-col gap-2', className)}>
          {items.map((item, index) => (
            <li key={item.id}>
              <SortableItem id={item.id} disabled={disabled}>
                {renderItem(item, index)}
              </SortableItem>
            </li>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

export { SortableList }
export type { SortableListProps }
