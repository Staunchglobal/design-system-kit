'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { FilterChips } from '@/components/ui/filter-chips'

export default function FilterChipsDemo() {
  const [filters, setFilters] = React.useState([
    { id: 'status', label: 'Status: Active' },
    { id: 'role', label: 'Role: Admin' },
    { id: 'region', label: 'Region: AU' },
  ])
  const [singleFilter, setSingleFilter] = React.useState([{ id: 'status', label: 'Status: Active' }])
  return (
    <ComponentSection
      id="filter-chips"
      title="Filter Chips"
      description="Applied-filter chips with per-chip remove and optional reset-all."
    >
      <Example title="With reset-all" contentClassName="block">
        <FilterChips
          filters={filters}
          onRemove={(id) => setFilters((f) => f.filter((x) => x.id !== id))}
          onResetAll={() => setFilters([])}
        />
      </Example>
      <Example title="Without reset-all" contentClassName="block">
        <FilterChips
          filters={singleFilter}
          onRemove={(id) => setSingleFilter((f) => f.filter((x) => x.id !== id))}
        />
      </Example>
    </ComponentSection>
  )
}
