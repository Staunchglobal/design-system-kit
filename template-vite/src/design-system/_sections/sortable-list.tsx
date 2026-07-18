'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { SortableList } from '@/components/ui/sortable-list'

type Row = { id: string; label: string }

const INITIAL: Row[] = [
  { id: 'a', label: 'Warm-up' },
  { id: 'b', label: 'Main set' },
  { id: 'c', label: 'Accessory work' },
  { id: 'd', label: 'Cool-down' },
]

export default function SortableListDemo() {
  const [items, setItems] = React.useState(INITIAL)

  return (
    <ComponentSection
      id="sortable-list"
      title="Sortable List"
      description="Accessible drag-and-drop reordering with pointer and keyboard sensors (@dnd-kit)."
    >
      <Example title="Reorder exercises" contentClassName="block w-full max-w-md">
        <SortableList
          items={items}
          onReorder={setItems}
          renderItem={(item) => (
            <div className="bg-card rounded-lg border px-3 py-2 text-sm">{item.label}</div>
          )}
        />
      </Example>
    </ComponentSection>
  )
}
