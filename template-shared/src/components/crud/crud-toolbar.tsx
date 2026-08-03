'use client'

import * as React from 'react'
import { Loader2, Plus, Search, X } from 'lucide-react'

import type { CrudTab } from '@/components/crud/types'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
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
    <div data-slot="crud-toolbar" className={cn(className)}>
      <div data-slot="crud-toolbar-row">
        {showSearch && onSearchChange ? (
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
            {(isSearchPending || search) && (
              <InputGroupAddon align="inline-end">
                {isSearchPending ? (
                  <Loader2 className="text-muted-foreground size-4 animate-spin" />
                ) : null}
                {search ? (
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    aria-label="Clear search"
                    onClick={() => onSearchChange('')}
                  >
                    <X />
                  </InputGroupButton>
                ) : null}
              </InputGroupAddon>
            )}
          </InputGroup>
        ) : (
          <div className="flex-1" />
        )}

        <div data-slot="crud-toolbar-actions">
          {toolbar}
          {onAdd ? (
            <Button type="button" size="sm" variant="outline" onClick={onAdd}>
              <Plus />
              {addLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {tabs?.length && onTabChange ? (
        <div data-slot="crud-toolbar-tabs" role="tablist">
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
