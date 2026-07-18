'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { FilterPopover } from '@/components/ui/filter-popover'
import { FilterChips } from '@/components/ui/filter-chips'

const OPTIONS = [
  { value: 'active', label: 'Active', count: 12 },
  { value: 'pending', label: 'Pending', count: 4 },
  { value: 'archived', label: 'Archived', count: 21 },
  { value: 'vip', label: 'VIP' },
]

export default function FilterPopoverDemo() {
  const [selected, setSelected] = React.useState<string[]>(['active'])
  const chips = selected.map((id) => ({
    id,
    label: OPTIONS.find((o) => o.value === id)?.label ?? id,
  }))

  return (
    <ComponentSection
      id="filter-popover"
      title="Filter Popover"
      description="Popover + Command multi-select filter. Pair with FilterChips to display applied filters."
    >
      <Example title="With FilterChips" contentClassName="block space-y-3">
        <FilterPopover
          label="Status"
          options={OPTIONS}
          selected={selected}
          onSelectedChange={setSelected}
        />
        <FilterChips
          filters={chips}
          onRemove={(id) => setSelected((s) => s.filter((v) => v !== id))}
          onResetAll={() => setSelected([])}
        />
      </Example>
    </ComponentSection>
  )
}
