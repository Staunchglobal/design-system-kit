'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type FilterChip = {
  id: string
  /** Filter name / title. When `value` is set, rendered with stronger contrast. */
  label: React.ReactNode
  /** Optional value shown after the title (e.g. "Active"). */
  value?: React.ReactNode
}

type FilterChipsProps = {
  filters: FilterChip[]
  onRemove: (id: string) => void
  onResetAll?: () => void
  className?: string
}

function FilterChips({
  filters,
  onRemove,
  onResetAll,
  className,
}: FilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <div
      data-slot="filter-chips"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span data-slot="filter-chips-summary" className="text-sm/5 text-muted-foreground">
        {filters.length} active filter{filters.length === 1 ? '' : 's'}
      </span>
      {filters.map((filter) => {
        const removeLabel =
          typeof filter.label === 'string'
            ? filter.value != null
              ? `${filter.label}: ${String(filter.value)}`
              : filter.label
            : 'filter'

        return (
          <Badge
            key={filter.id}
            variant="secondary"
            data-slot="filter-chip"
            className="inline-flex h-8 items-center gap-0.5 overflow-hidden rounded-md border border-border bg-neutral-0 ps-2 pe-1 py-1 text-sm/5 font-medium text-foreground dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <span
              data-slot="filter-chip-content"
              className="inline-flex min-w-0 items-center gap-1"
            >
              {filter.value != null ? (
                <>
                  <span data-slot="filter-chip-key" className="font-medium text-muted-foreground">
                    {filter.label}
                  </span>
                  <span data-slot="filter-chip-sep" aria-hidden className="text-muted-foreground">
                    :
                  </span>
                  <span data-slot="filter-chip-value" className="font-medium text-foreground">
                    {filter.value}
                  </span>
                </>
              ) : (
                <span data-slot="filter-chip-value" className="font-medium text-foreground">
                  {filter.label}
                </span>
              )}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              data-slot="filter-chip-remove"
              aria-label={`Remove ${removeLabel}`}
              onClick={() => onRemove(filter.id)}
            >
              <X className="size-3" />
            </Button>
          </Badge>
        )
      })}
      {onResetAll ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          data-slot="filter-chips-reset"
          className="h-auto p-0"
          onClick={onResetAll}
        >
          Reset all
        </Button>
      ) : null}
    </div>
  )
}

export { FilterChips }
export type { FilterChipsProps, FilterChip }
