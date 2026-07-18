'use client'

import * as React from 'react'
import { Filter } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type FilterOption = {
  value: string
  label: React.ReactNode
  count?: number
}

type FilterPopoverProps = {
  options: FilterOption[]
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  label?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

function FilterPopover({
  options,
  selected,
  onSelectedChange,
  label = 'Filter',
  searchPlaceholder = 'Search filters...',
  emptyMessage = 'No results found.',
  className,
}: FilterPopoverProps) {
  const [open, setOpen] = React.useState(false)

  function toggle(value: string) {
    if (selected.includes(value)) {
      onSelectedChange(selected.filter((v) => v !== value))
    } else {
      onSelectedChange([...selected, value])
    }
  }

  return (
    <div data-slot="filter-popover" className="inline-flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className={cn('gap-1.5', className)}
          >
            <Filter className="size-4 shrink-0" />
            {label}
            {selected.length > 0 && (
              <Badge
                variant="secondary"
                data-slot="filter-popover-count"
                className="ml-0.5 h-4 min-w-4 rounded-full px-1 font-mono text-[10px] leading-none"
              >
                {selected.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent data-ui="filter-popover-content" className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      data-checked={isSelected}
                      onSelect={() => toggle(option.value)}
                      aria-selected={isSelected}
                    >
                      <span className="flex flex-1 items-center gap-2">
                        {option.label}
                        {option.count != null && (
                          <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                            {option.count}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { FilterPopover }
export type { FilterOption, FilterPopoverProps }
