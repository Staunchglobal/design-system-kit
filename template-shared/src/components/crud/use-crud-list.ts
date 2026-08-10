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
  /**
   * Controlled tab value (e.g. driven by a route segment) — pass this
   * together with `onTabChange` to make tab switches navigate instead of
   * being internal state. Detected by `!== undefined`, the same convention
   * `useChatInbox`'s `tab`/`chatId` controlled props already use — omit
   * both to keep the tab as plain internal state (the default).
   */
  activeTab?: string | null
  onTabChange?: (tab: string) => void
}

export function useCrudList<T>({
  fetchPage,
  getItemId,
  pageSize: initialPageSize = 10,
  debounceMs = SEARCH_DEBOUNCE_MS,
  initialTab = null,
  activeTab: activeTabProp,
  onTabChange: onTabChangeProp,
}: UseCrudListOptions<T>) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSizeState] = React.useState(initialPageSize)
  const [search, setSearch] = React.useState('')
  const [sort, setSort] = React.useState<CrudSortState>(null)
  const tabControlled = activeTabProp !== undefined
  const [internalTab, setInternalTab] = React.useState<string | null>(initialTab)
  const activeTab = tabControlled ? activeTabProp : internalTab
  const [items, setItems] = React.useState<T[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [initialLoading, setInitialLoading] = React.useState(true)
  const [fetching, setFetching] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const [reloadToken, setReloadToken] = React.useState(0)

  const { debouncedValue: debouncedSearch, isPending: isSearchPending } = useDebouncedSearch(
    search,
    debounceMs
  )

  const fetchPageRef = React.useRef(fetchPage)
  const getItemIdRef = React.useRef(getItemId)
  const pageRef = React.useRef(page)

  React.useEffect(() => {
    fetchPageRef.current = fetchPage
  }, [fetchPage])

  React.useEffect(() => {
    getItemIdRef.current = getItemId
  }, [getItemId])

  React.useEffect(() => {
    pageRef.current = page
  }, [page])

  // Reset to page 1 when the query changes (React "adjusting state during render" pattern —
  // avoids setState-in-effect when filters/search settle).
  const [prevQuery, setPrevQuery] = React.useState({
    debouncedSearch,
    sort,
    activeTab,
    pageSize,
  })
  if (
    prevQuery.debouncedSearch !== debouncedSearch ||
    prevQuery.sort !== sort ||
    prevQuery.activeTab !== activeTab ||
    prevQuery.pageSize !== pageSize
  ) {
    setPrevQuery({ debouncedSearch, sort, activeTab, pageSize })
    if (page !== 1) {
      setPage(1)
    }
  }

  const setPageSize = React.useCallback((next: number) => {
    setPageSizeState(next)
    setPage(1)
  }, [])

  const setActiveTab = React.useCallback(
    (next: string | null) => {
      // Switching tabs re-fetches a shorter/taller page than whatever the
      // user had scrolled to — restore the scroll position after the DOM
      // updates instead of letting the browser leave it wherever the new
      // content happens to end.
      const scroller = document.querySelector<HTMLElement>('[data-slot="app-content-scroll"]')
      const scrollTop = scroller?.scrollTop ?? 0
      const restoreScroll = () => {
        if (!scroller) return
        scroller.scrollTop = scrollTop
      }

      if (tabControlled) {
        // The prevQuery diff below resets `page` whenever the resolved
        // `activeTab` changes for any reason, controlled or not — no need
        // to duplicate that here once the parent re-renders with `next`.
        if (next != null) onTabChangeProp?.(next)
        requestAnimationFrame(restoreScroll)
        return
      }
      setInternalTab(next)
      setPage(1)
      requestAnimationFrame(restoreScroll)
    },
    [tabControlled, onTabChangeProp]
  )

  // Mark fetching during render when the query key changes.
  // Do NOT clear `items` here — keep the previous rows painted until the new
  // page arrives so the area below the tabs doesn't bounce while loading.
  const fetchKey = isSearchPending
    ? null
    : `${page}|${pageSize}|${debouncedSearch}|${sort?.field ?? ''}|${sort?.order ?? ''}|${activeTab ?? ''}|${reloadToken}`
  const [prevFetchKey, setPrevFetchKey] = React.useState(fetchKey)
  if (fetchKey !== prevFetchKey) {
    setPrevFetchKey(fetchKey)
    if (fetchKey !== null) {
      setFetching(true)
      setError(null)
    }
  }

  React.useEffect(() => {
    if (isSearchPending) return

    let cancelled = false

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
        if (cancelled) return
        setFetching(false)
        setInitialLoading(false)
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
    /** True only before the first successful fetch paints rows. */
    loading: initialLoading && items.length === 0,
    /** True whenever a fetch is in flight (tab/filter/page). Does not clear rows. */
    isFetching: fetching,
    error,
    refetch,
    insertItem,
    replaceItem,
    removeItem,
  }
}
