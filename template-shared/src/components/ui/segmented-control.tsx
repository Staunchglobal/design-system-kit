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
  className?: string
}

function SegmentedControl({
  options,
  value,
  onValueChange,
  ariaLabel,
  className,
}: SegmentedControlProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          data-slot="segmented-control"
          aria-label={ariaLabel}
          className={cn('w-full', className)}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                {opt.label}
                {opt.count != null ? (
                  <span className="text-muted-foreground text-xs">({opt.count})</span>
                ) : null}
              </span>
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
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
      aria-label={ariaLabel}
      className={cn(className)}
    >
      {options.map((opt) => (
        <ToggleGroupItem key={opt.value} value={opt.value} className="px-3">
          <span className="flex items-center gap-1.5">
            {opt.label}
            {opt.count != null ? (
              <span className="text-muted-foreground text-xs tabular-nums">{opt.count}</span>
            ) : null}
          </span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { SegmentedControl }
export type { SegmentedControlProps, SegmentedControlOption }
