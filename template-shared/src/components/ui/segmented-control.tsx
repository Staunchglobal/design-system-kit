'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type SegmentedControlOption = {
  value: string
  label: React.ReactNode
  count?: React.ReactNode
}

type SegmentedControlProps = {
  options: SegmentedControlOption[]
  value: string
  onValueChange: (value: string) => void
  ariaLabel: string
  disabled?: boolean
  className?: string
}

function SegmentedControl({
  options,
  value,
  onValueChange,
  ariaLabel,
  disabled = false,
  className,
}: SegmentedControlProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        {/* Matches the desktop track's height (0.25rem pad × 2 + 1.875rem item = 2.375rem) so
            swapping breakpoints doesn't jump the surrounding layout. */}
        <SelectTrigger
          data-slot="segmented-control"
          size="sm"
          aria-label={ariaLabel}
          className={cn(
            'h-[2.375rem]! min-h-[2.375rem]! rounded-full! border-border bg-neutral-0 py-0! text-sm leading-none focus-visible:border-primary focus-visible:ring-0 w-full',
            className
          )}
        >
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
              {opt.count != null ? ` (${opt.count})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <ToggleGroup
      data-slot="segmented-control"
      type="single"
      variant="outline"
      spacing={0}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
      aria-label={ariaLabel}
      className={cn('rounded-full! border-0 bg-neutral-100 p-1 shadow-none dark:bg-neutral-800', className)}
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className={cn(
            'h-[1.875rem] min-w-0 gap-2 rounded-full! border-0! bg-transparent px-6 py-1 text-sm font-medium text-muted-600 shadow-none transition-[background-color,color,box-shadow] duration-150',
            'hover:bg-transparent hover:text-muted-600 dark:text-muted-400 dark:hover:text-muted-400',
            'data-[state=on]:bg-neutral-0 data-[state=on]:text-foreground data-[state=on]:font-semibold data-[state=on]:shadow-(--shadow-xs) dark:data-[state=on]:bg-neutral-900',
            'data-[state=on]:hover:bg-neutral-0 data-[state=on]:hover:text-foreground dark:data-[state=on]:hover:bg-neutral-900'
          )}
          // Radix focuses the item on pointer down, which scrolls it into
          // view and jerks the page up/down inside overflow containers.
          onPointerDown={(e) => e.preventDefault()}
        >
          <span className="flex items-center gap-1.5">
            {opt.label}
            {opt.count != null ? (
              <span className="text-xs tabular-nums opacity-70">{opt.count}</span>
            ) : null}
          </span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { SegmentedControl }
export type { SegmentedControlProps, SegmentedControlOption }
