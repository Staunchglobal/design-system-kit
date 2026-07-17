'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type FilterChip = {
  id: string
  label: React.ReactNode
}

type FilterChipsProps = {
  filters: FilterChip[]
  onRemove: (id: string) => void
  onResetAll?: () => void
  className?: string
}

function FilterChips({ filters, onRemove, onResetAll, className }: FilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <div
      data-slot="filter-chips"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span className="text-muted-foreground text-sm">
        {filters.length} active filter{filters.length === 1 ? '' : 's'}
      </span>
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          data-slot="filter-chip"
          className="bg-muted text-foreground gap-1 rounded-sm pr-0.5 font-medium"
        >
          {filter.label}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-5 opacity-50 hover:opacity-100"
            aria-label={`Remove ${typeof filter.label === 'string' ? filter.label : 'filter'}`}
            onClick={() => onRemove(filter.id)}
          >
            <X className="size-3" />
          </Button>
        </Badge>
      ))}
      {onResetAll ? (
        <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onResetAll}>
          Reset all
        </Button>
      ) : null}
    </div>
  )
}

export { FilterChips }
export type { FilterChipsProps, FilterChip }
