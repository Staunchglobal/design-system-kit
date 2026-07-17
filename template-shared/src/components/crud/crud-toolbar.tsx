'use client'

import * as React from 'react'
import { Loader2, Plus, Search, X } from 'lucide-react'

import type { CrudTab } from '@/components/crud/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type CrudToolbarProps = {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  isSearchPending?: boolean
  showSearch?: boolean
  addLabel?: string
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
  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showSearch && onSearchChange ? (
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pr-16 pl-8"
              aria-label={searchPlaceholder}
            />
            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5">
              {isSearchPending ? (
                <Loader2 className="text-muted-foreground size-4 animate-spin" />
              ) : null}
              {search ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="size-6"
                  aria-label="Clear search"
                  onClick={() => onSearchChange('')}
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {toolbar}
          {onAdd ? (
            <Button type="button" onClick={onAdd}>
              <Plus />
              {addLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {tabs?.length && onTabChange ? (
        <div className="flex flex-wrap gap-1" role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.value === activeTab
            return (
              <Button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                onClick={() => onTabChange(tab.value)}
              >
                {tab.label}
                {tab.count != null ? (
                  <span className="text-muted-foreground ml-1 tabular-nums opacity-80">
                    {tab.count}
                  </span>
                ) : null}
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
