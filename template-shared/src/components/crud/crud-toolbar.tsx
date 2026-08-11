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
    <div data-slot="crud-toolbar" className={cn(className)}>
      {showTabs ? (
        <div data-slot="crud-toolbar-tabs">
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
        <div data-slot="crud-toolbar-filters">
          <div data-slot="crud-toolbar-row">
            {showSearch && onSearchChange ? (
              <div data-slot="crud-search">
                <Search data-ui="crud-search-icon" aria-hidden />
                <input
                  data-ui="crud-search-input"
                  type="search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                />
                {isSearchPending ? (
                  <span data-ui="crud-search-pending" aria-hidden>
                    <Spinner className="size-3.5" />
                  </span>
                ) : search ? (
                  <button
                    type="button"
                    data-ui="crud-search-clear"
                    aria-label="Clear search"
                    onClick={() => onSearchChange('')}
                  >
                    <X />
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <div data-slot="crud-toolbar-actions">
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
