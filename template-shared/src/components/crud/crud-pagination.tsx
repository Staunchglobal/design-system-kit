'use client'

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

/** Build a compact page list with ellipsis gaps, e.g. [1, '…', 4, 5, 6, '…', 20]. */
export function pageItems(page: number, pageCount: number): Array<number | 'ellipsis'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const items: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)

  if (start > 2) items.push('ellipsis')
  for (let n = start; n <= end; n++) items.push(n)
  if (end < pageCount - 1) items.push('ellipsis')
  items.push(pageCount)
  return items
}

export type CrudPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  totalCount?: number
  /** Overrides the default “Showing X – Y of Z …” summary. */
  totalLabel?: string
  /** Plural noun for the default summary, e.g. "orders" / "posts". */
  itemLabel?: string
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  className?: string
}

export function CrudPagination({
  page,
  pageCount,
  onPageChange,
  totalCount,
  totalLabel,
  itemLabel = 'items',
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: CrudPaginationProps) {
  const pages = pageItems(page, pageCount)

  const rangeStart =
    totalCount == null || pageSize == null
      ? null
      : totalCount === 0
        ? 0
        : (page - 1) * pageSize + 1
  const rangeEnd =
    totalCount == null || pageSize == null || rangeStart == null
      ? null
      : Math.min(page * pageSize, totalCount)

  const summary =
    totalLabel ??
    (rangeStart != null && rangeEnd != null && totalCount != null
      ? null
      : totalCount != null
        ? `${totalCount} ${itemLabel}`
        : null)

  return (
    <div data-slot="crud-pagination" className={cn(className)}>
      <div className="flex flex-wrap items-center gap-3">
        {summary != null ? (
          <p data-slot="crud-pagination-summary">{summary}</p>
        ) : rangeStart != null && rangeEnd != null && totalCount != null ? (
          <p data-slot="crud-pagination-summary">
            Showing{' '}
            <span data-ui="crud-pagination-range">
              {rangeStart} – {rangeEnd}
            </span>
            {` of ${totalCount} ${itemLabel}`}
          </p>
        ) : null}

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

      <Pagination>
        <PaginationContent>
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
        </PaginationContent>
      </Pagination>
    </div>
  )
}
