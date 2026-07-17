'use client'

import * as React from 'react'

import { useDebouncedSearch, SEARCH_DEBOUNCE_MS } from '@/components/crud/use-debounced-value'
import type { CrudPageParams, CrudPageResult, CrudSortState } from '@/components/crud/types'

export type UseCrudListOptions<T> = {
  fetchPage: (params: CrudPageParams) => Promise<CrudPageResult<T>>
  getItemId: (item: T) => string
  pageSize?: number
  debounceMs?: number
  initialTab?: string | null
}

export function useCrudList<T>({
  fetchPage,
  getItemId,
  pageSize: initialPageSize = 10,
  debounceMs = SEARCH_DEBOUNCE_MS,
  initialTab = null,
}: UseCrudListOptions<T>) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSizeState] = React.useState(initialPageSize)
  const [search, setSearch] = React.useState('')
  const [sort, setSort] = React.useState<CrudSortState>(null)
  const [activeTab, setActiveTabState] = React.useState<string | null>(initialTab)
  const [items, setItems] = React.useState<T[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const [reloadToken, setReloadToken] = React.useState(0)

  const { debouncedValue: debouncedSearch, isPending: isSearchPending } = useDebouncedSearch(
    search,
    debounceMs
  )

  const fetchPageRef = React.useRef(fetchPage)
  fetchPageRef.current = fetchPage

  const getItemIdRef = React.useRef(getItemId)
  getItemIdRef.current = getItemId

  const pageRef = React.useRef(page)
  pageRef.current = page

  const queryRef = React.useRef({ debouncedSearch, sort, activeTab, pageSize })

  const setPageSize = React.useCallback((next: number) => {
    setPageSizeState(next)
    setPage(1)
  }, [])

  const setActiveTab = React.useCallback((next: string | null) => {
    setActiveTabState(next)
    setPage(1)
  }, [])

  React.useEffect(() => {
    if (isSearchPending) return

    const prev = queryRef.current
    const queryChanged =
      prev.debouncedSearch !== debouncedSearch ||
      prev.sort !== sort ||
      prev.activeTab !== activeTab ||
      prev.pageSize !== pageSize

    if (queryChanged) {
      queryRef.current = { debouncedSearch, sort, activeTab, pageSize }
      if (page !== 1) {
        setPage(1)
        return
      }
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPageRef
      .current({
        page,
        pageSize,
        search: debouncedSearch,
        sort,
        tab: activeTab,
      })
      .then((result) => {
        if (cancelled) return
        setItems(result.items)
        setTotalCount(result.totalCount)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, pageSize, debouncedSearch, sort, activeTab, isSearchPending, reloadToken])

  const refetch = React.useCallback(() => {
    setReloadToken((t) => t + 1)
  }, [])

  const insertItem = React.useCallback((item: T) => {
    const id = getItemIdRef.current(item)
    setItems((prev) => {
      if (prev.some((row) => getItemIdRef.current(row) === id)) {
        return prev.map((row) => (getItemIdRef.current(row) === id ? item : row))
      }
      return [item, ...prev]
    })
    setTotalCount((c) => c + 1)
  }, [])

  const replaceItem = React.useCallback((id: string, item: T) => {
    setItems((prev) => prev.map((row) => (getItemIdRef.current(row) === id ? item : row)))
  }, [])

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((row) => getItemIdRef.current(row) !== id)
      if (next.length !== prev.length) {
        setTotalCount((c) => {
          const nextCount = Math.max(0, c - 1)
          // Learnerpass: if this was the last row on a page > 1, step back.
          if (next.length === 0 && pageRef.current > 1) {
            setPage((p) => Math.max(1, p - 1))
          }
          return nextCount
        })
      }
      return next
    })
  }, [])

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize) || 1)

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    search,
    setSearch,
    debouncedSearch,
    isSearchPending,
    sort,
    setSort,
    activeTab,
    setActiveTab,
    items,
    totalCount,
    loading,
    error,
    refetch,
    insertItem,
    replaceItem,
    removeItem,
  }
}
