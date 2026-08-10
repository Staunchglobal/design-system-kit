'use client'

import { AppIcon } from '@/components/icons/icon'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/**
 * Page list for many pages — always first + last, a ±2 window around
 * the current page, and ellipses when the gap is large enough
 * (`totalPages >= 5`).
 */
export function pageItems(page: number, pageCount: number): Array<number | 'ellipsis'> {
  if (pageCount <= 0) return []
  if (pageCount === 1) return [1]

  const items: Array<number | 'ellipsis'> = [1]

  if (pageCount >= 5 && page > 4) {
    items.push('ellipsis')
  }

  const start = Math.max(2, page - 2)
  const end = Math.min(pageCount - 1, page + 2)
  for (let n = start; n <= end; n++) {
    items.push(n)
  }

  if (pageCount >= 5 && page + 3 < pageCount) {
    items.push('ellipsis')
  }

  items.push(pageCount)
  return items
}

export type CrudPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  className?: string
}

export function CrudPagination({
  page,
  pageCount,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: CrudPaginationProps) {
  const pages = pageItems(page, pageCount)

  return (
    <div data-slot="crud-pagination" className={cn(className)}>
      <div className="flex flex-wrap items-center gap-3">
        {pageSize != null && pageSizeOptions?.length && onPageSizeChange ? (
          <div className="flex items-center gap-1.5">
            <span id="crud-rows-label" className="text-muted-foreground">
              Rows
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger
                size="sm"
                className="w-auto gap-1 px-2.5"
                aria-labelledby="crud-rows-label"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      {pageCount > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                size="icon"
                aria-label="Go to previous page"
                aria-disabled={page <= 1 || undefined}
                className={cn(page <= 1 && 'pointer-events-none opacity-50')}
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) onPageChange(page - 1)
                }}
              >
                <AppIcon name="pagination.previous" />
              </PaginationLink>
            </PaginationItem>
            {pages.map((item, index) =>
              item === 'ellipsis' ? (
                <PaginationItem key={`e-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={item === page}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(item)
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                size="icon"
                aria-label="Go to next page"
                aria-disabled={page >= pageCount || undefined}
                className={cn(page >= pageCount && 'pointer-events-none opacity-50')}
                onClick={(e) => {
                  e.preventDefault()
                  if (page < pageCount) onPageChange(page + 1)
                }}
              >
                <AppIcon name="pagination.next" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
