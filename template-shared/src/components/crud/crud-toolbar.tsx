'use client'

import * as React from 'react'
import { Plus, Search, X } from 'lucide-react'

import type { CrudTab } from '@/components/crud/types'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export type CrudToolbarProps = {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  isSearchPending?: boolean
  showSearch?: boolean
  addLabel?: string
  /** When omitted, the Add CTA is expected to live in the page header instead. */
  onAdd?: () => void
  toolbar?: React.ReactNode
  tabs?: CrudTab[]
  activeTab?: string | null
  onTabChange?: (value: string) => void
  className?: string
}

export function CrudToolbar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search…',
  isSearchPending = false,
  showSearch = true,
  addLabel = 'Add',
  onAdd,
  toolbar,
  tabs,
  activeTab,
  onTabChange,
  className,
}: CrudToolbarProps) {
  const showTabs = Boolean(tabs?.length && onTabChange)
  const showSearchRow =
    (showSearch && Boolean(onSearchChange)) || Boolean(toolbar) || Boolean(onAdd)

  if (!showTabs && !showSearchRow) return null

  return (
    <div
      data-slot="crud-toolbar"
      className={cn(
        'flex flex-col gap-3 border-b border-border bg-neutral-50 px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      {showTabs ? (
        <div data-slot="crud-toolbar-tabs" className="flex w-full flex-wrap [&_[data-slot=segmented-control]]:w-fit [&_[data-slot=segmented-control]]:max-w-full max-md:[&_[data-slot=segmented-control]]:w-full">
          <SegmentedControl
            ariaLabel="Filter list"
            value={activeTab ?? tabs![0]!.value}
            onValueChange={onTabChange!}
            options={tabs!.map((tab) => ({
              value: tab.value,
              label: tab.label,
              count: tab.count,
            }))}
          />
        </div>
      ) : null}

      {showSearchRow ? (
        <div data-slot="crud-toolbar-filters" className="contents">
          <div
            data-slot="crud-toolbar-row"
            className="flex w-full flex-wrap items-center justify-between gap-3"
          >
            {showSearch && onSearchChange ? (
              <div
                data-slot="crud-search"
                className="relative w-full max-w-[248px] min-w-[200px] shrink-0 flex-none max-md:max-w-none max-md:min-w-0 max-md:flex-[1_1_100%]"
              >
                <Search
                  data-ui="crud-search-icon"
                  aria-hidden
                  className="text-muted-600 pointer-events-none absolute top-1/2 left-2.5 z-1 size-4 -translate-y-1/2"
                />
                <input
                  data-ui="crud-search-input"
                  type="search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                  className="text-foreground border-muted-400 placeholder:text-muted-400 box-border block h-[34px] min-h-[34px] w-full min-w-[200px] appearance-none rounded-lg border py-2.5 ps-8 pe-8 text-xs leading-3 outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none max-md:min-w-0 dark:border-neutral-700 dark:bg-neutral-950"
                />
                {isSearchPending ? (
                  <span
                    data-ui="crud-search-pending"
                    aria-hidden
                    className="text-muted-600 absolute top-1/2 right-2.5 z-1 inline-flex size-4 -translate-y-1/2 cursor-default items-center justify-center"
                  >
                    <Spinner className="size-3.5" />
                  </span>
                ) : search ? (
                  <button
                    type="button"
                    data-ui="crud-search-clear"
                    aria-label="Clear search"
                    onClick={() => onSearchChange('')}
                    className="text-muted-600 absolute top-1/2 right-2.5 z-1 inline-flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 [&>svg]:size-3.5"
                  >
                    <X />
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <div data-slot="crud-toolbar-actions" className="flex flex-wrap items-center justify-end gap-2 max-md:w-full max-md:justify-stretch max-md:[&>*]:flex-1">
              {toolbar}
              {onAdd ? (
                <Button type="button" size="sm" onClick={onAdd}>
                  <Plus />
                  {addLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
