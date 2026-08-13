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
            className={cn(
              'h-auto min-h-0 gap-1 rounded-full border border-neutral-200 bg-neutral-0 p-2 text-xs/4 font-medium text-foreground hover:bg-neutral-50 aria-expanded:bg-neutral-50 [&_svg]:size-3.5 [&_svg]:text-muted-600 has-[[data-slot=filter-popover-count]]:border-0 has-[[data-slot=filter-popover-count]]:bg-primary-50 has-[[data-slot=filter-popover-count]]:hover:bg-primary-50 has-[[data-slot=filter-popover-count]]:aria-expanded:bg-primary-50 has-[[data-slot=filter-popover-count]]:[&_svg]:text-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:aria-expanded:bg-neutral-800 dark:[&_svg]:text-muted-400 dark:has-[[data-slot=filter-popover-count]]:bg-neutral-800 dark:has-[[data-slot=filter-popover-count]]:hover:bg-neutral-700 dark:has-[[data-slot=filter-popover-count]]:aria-expanded:bg-neutral-700 dark:has-[[data-slot=filter-popover-count]]:[&_svg]:text-primary-400',
              className
            )}
          >
            <Filter className="size-4 shrink-0" />
            {label}
            {selected.length > 0 && (
              <Badge
                variant="secondary"
                data-slot="filter-popover-count"
                className="ms-0 inline-flex h-5 min-w-5 w-auto items-center justify-center rounded-full bg-primary-500 px-2 py-0 text-xs leading-none font-medium text-neutral-0 tabular-nums dark:bg-primary-400 dark:text-primary-950"
              >
                {selected.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-ui="filter-popover-content"
          className="w-72 overflow-hidden rounded-2xl p-0"
          align="start"
        >
          <Command className="p-0">
            <CommandInput placeholder={searchPlaceholder} wrapperClassName="p-3 pb-2" />
            <CommandList className="px-1.5 pt-1 pb-2">
              <CommandEmpty className="py-5">{emptyMessage}</CommandEmpty>
              <CommandGroup className="p-1">
                {options.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      data-checked={isSelected}
                      onSelect={() => toggle(option.value)}
                      aria-selected={isSelected}
                      className="items-center gap-2 px-2.5 py-2 cursor-pointer"
                    >
                      <span data-slot="filter-popover-option" className="flex min-w-0 flex-1 items-center gap-2">
                        <span
                          data-slot="filter-popover-option-label"
                          className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          {option.label}
                        </span>
                        {option.count != null && (
                          <span
                            data-slot="filter-popover-option-count"
                            className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums"
                          >
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
