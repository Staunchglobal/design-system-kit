'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
  totalLabel?: string
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
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: CrudPaginationProps) {
  const pages = pageItems(page, pageCount)

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 sm:flex-row sm:justify-between',
        className
      )}
    >
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
        {totalCount != null ? (
          <p>
            {totalLabel ??
              `${totalCount} item${totalCount === 1 ? '' : 's'}`}
          </p>
        ) : null}

        {pageSize != null && pageSizeOptions?.length && onPageSizeChange ? (
          <label className="flex items-center gap-1.5">
            <span>Rows</span>
            <select
              className="border-input bg-background h-7 rounded-md border px-2 text-xs"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={page <= 1}
              className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
              onClick={(e) => {
                e.preventDefault()
                if (page > 1) onPageChange(page - 1)
              }}
            />
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
            <PaginationNext
              href="#"
              aria-disabled={page >= pageCount}
              className={page >= pageCount ? 'pointer-events-none opacity-50' : undefined}
              onClick={(e) => {
                e.preventDefault()
                if (page < pageCount) onPageChange(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
