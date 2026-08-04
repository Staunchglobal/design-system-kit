'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

import { CrudDeleteDialog } from '@/components/crud/crud-delete-dialog'
import type { CrudAction, CrudColumn, CrudListMutators, CrudSortState } from '@/components/crud/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export type DataTableProps<T> = {
  columns: CrudColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  sortState?: CrudSortState
  onSortChange?: (sort: CrudSortState) => void
  isLoading?: boolean
  emptyMessage?: string
  actions?: CrudAction<T>[]
  /** Passed through to every action's onClick as its 2nd argument — lets a custom action update the visible list directly from its own mutation's response instead of refetching. */
  listMutators?: CrudListMutators<T>
  className?: string
}

function cellValue<T>(column: CrudColumn<T>, row: T): React.ReactNode {
  if (column.render) return column.render(row)
  const value = (row as Record<string, unknown>)[column.key]
  if (value == null) return ''
  return String(value)
}

function SortIcon({ field, sortState }: { field: string; sortState: CrudSortState }) {
  if (!sortState || sortState.field !== field) {
    return <ArrowUpDown className="text-muted-foreground size-3.5 opacity-50" />
  }
  return sortState.order === 'asc' ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  )
}

function cycleSort(current: CrudSortState, field: string): CrudSortState {
  if (!current || current.field !== field) return { field, order: 'asc' }
  if (current.order === 'asc') return { field, order: 'desc' }
  return null
}

function noopListMutators<T>(): CrudListMutators<T> {
  return { insertItem: () => {}, replaceItem: () => {}, removeItem: () => {} }
}

function ActionButtons<T>({
  actions,
  row,
  onConfirmRequest,
  listMutators,
}: {
  actions: CrudAction<T>[]
  row: T
  onConfirmRequest: (action: CrudAction<T>, row: T) => void
  listMutators: CrudListMutators<T>
}) {
  const visibleActions = actions.filter((action) => !action.isVisible || action.isVisible(row))
  // Non-confirm actions (e.g. "Restore") have no dialog of their own to show progress/errors —
  // this is the only feedback a consumer gets unless it rolls its own toast/loading, so give
  // every one a busy-disabled state and a toast on failure for free.
  const [pendingKey, setPendingKey] = React.useState<string | null>(null)

  return (
    <div className="flex items-center justify-end gap-1">
      {visibleActions.map((action) => (
        <Button
          key={action.key}
          type="button"
          size="sm"
          variant={action.variant ?? (action.confirm ? 'destructive' : 'outline')}
          disabled={pendingKey === action.key}
          onClick={async () => {
            if (action.confirm) {
              onConfirmRequest(action, row)
              return
            }
            setPendingKey(action.key)
            try {
              await action.onClick(row, listMutators)
            } catch (err) {
              toast.error(err instanceof Error ? err.message : `${action.label} failed`)
            } finally {
              setPendingKey(null)
            }
          }}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  )
}

function MobileCards<T>({
  columns,
  data,
  getRowId,
  actions,
  emptyMessage,
  isLoading,
  onConfirmRequest,
  listMutators,
}: {
  columns: CrudColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  actions?: CrudAction<T>[]
  emptyMessage: string
  isLoading?: boolean
  onConfirmRequest: (action: CrudAction<T>, row: T) => void
  listMutators: CrudListMutators<T>
}) {
  const visible = columns.filter((c) => !c.hideOnMobile)
  const pairedKeys = new Set(visible.map((c) => c.pairWith).filter(Boolean) as string[])

  if (!isLoading && data.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((row) => {
        const rendered = new Set<string>()
        return (
          <div
            key={getRowId(row)}
            className="bg-card relative space-y-3 rounded-lg border p-4 pt-12"
          >
            {actions?.length ? (
              <div className="absolute top-3 right-3">
                <ActionButtons actions={actions} row={row} onConfirmRequest={onConfirmRequest} listMutators={listMutators} />
              </div>
            ) : null}

            {visible.map((column) => {
              if (rendered.has(column.key)) return null
              if (pairedKeys.has(column.key) && !column.pairWith) return null

              if (column.pairWith) {
                const partner = visible.find((c) => c.key === column.pairWith)
                rendered.add(column.key)
                if (partner) rendered.add(partner.key)
                return (
                  <div key={column.key} className="grid grid-cols-2 gap-3">
                    <MobileField column={column} row={row} />
                    {partner ? <MobileField column={partner} row={row} /> : null}
                  </div>
                )
              }

              rendered.add(column.key)
              return <MobileField key={column.key} column={column} row={row} />
            })}
          </div>
        )
      })}
    </div>
  )
}

function MobileField<T>({ column, row }: { column: CrudColumn<T>; row: T }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <div className="text-muted-foreground text-xs font-medium">
        {column.mobileLabel ?? column.header}
      </div>
      <div className={cn('text-sm break-words whitespace-normal', column.className)}>
        {cellValue(column, row)}
      </div>
    </div>
  )
}

function DesktopTable<T>({
  columns,
  data,
  getRowId,
  sortState,
  onSortChange,
  isLoading,
  emptyMessage,
  actions,
  onConfirmRequest,
  listMutators,
}: {
  columns: CrudColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  sortState?: CrudSortState
  onSortChange?: (sort: CrudSortState) => void
  isLoading?: boolean
  emptyMessage: string
  actions?: CrudAction<T>[]
  onConfirmRequest: (action: CrudAction<T>, row: T) => void
  listMutators: CrudListMutators<T>
}) {
  const columnDefs = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    const defs: ColumnDef<T, unknown>[] = columns.map((column) => ({
      id: column.key,
      accessorFn: (row) => (row as Record<string, unknown>)[column.key],
      header: () => {
        if (!column.sortable || !onSortChange) return column.header
        return (
          <button
            type="button"
            className="hover:text-foreground inline-flex items-center gap-1.5"
            onClick={() => onSortChange(cycleSort(sortState ?? null, column.key))}
          >
            {column.header}
            <SortIcon field={column.key} sortState={sortState ?? null} />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className={cn(column.className)}>{cellValue(column, row.original)}</div>
      ),
    }))

    if (actions?.length) {
      defs.push({
        id: '__actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <ActionButtons
            actions={actions}
            row={row.original}
            onConfirmRequest={onConfirmRequest}
            listMutators={listMutators}
          />
        ),
        enableSorting: false,
      })
    }

    return defs
  }, [columns, actions, sortState, onSortChange, onConfirmRequest, listMutators])

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => getRowId(row),
    manualSorting: true,
  })

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      cell.column.id === '__actions' ? undefined : 'max-w-xs whitespace-normal'
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columnDefs.length}
                className="text-muted-foreground h-24 text-center whitespace-normal"
              >
                {isLoading ? 'Loading…' : emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  sortState,
  onSortChange,
  isLoading,
  emptyMessage = 'No results.',
  actions,
  listMutators,
  className,
}: DataTableProps<T>) {
  const isMobile = useIsMobile()
  const resolvedListMutators = listMutators ?? noopListMutators<T>()
  const [pending, setPending] = React.useState<{ action: CrudAction<T>; row: T } | null>(null)
  const [confirming, setConfirming] = React.useState(false)

  const onConfirmRequest = React.useCallback((action: CrudAction<T>, row: T) => {
    setPending({ action, row })
  }, [])

  return (
    <div className={cn('relative w-full', className)} data-slot="crud-table">
      {isLoading && data.length > 0 ? (
        <div
          aria-hidden
          className="bg-background/40 pointer-events-none absolute inset-0 z-10 rounded-lg"
        />
      ) : null}

      {isMobile ? (
        <MobileCards
          columns={columns}
          data={data}
          getRowId={getRowId}
          actions={actions}
          emptyMessage={isLoading ? 'Loading…' : emptyMessage}
          isLoading={isLoading}
          onConfirmRequest={onConfirmRequest}
          listMutators={resolvedListMutators}
        />
      ) : (
        <DesktopTable
          columns={columns}
          data={data}
          getRowId={getRowId}
          sortState={sortState}
          onSortChange={onSortChange}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          actions={actions}
          onConfirmRequest={onConfirmRequest}
          listMutators={resolvedListMutators}
        />
      )}

      <CrudDeleteDialog
        open={pending != null}
        onOpenChange={(open) => {
          if (!open && !confirming) {
            setPending(null)
            setConfirming(false)
          }
        }}
        title={pending?.action.confirm?.title}
        description={pending?.action.confirm?.description}
        confirmLabel={pending?.action.confirm?.confirmLabel}
        confirmingLabel={pending?.action.confirm?.confirmingLabel}
        cancelLabel={pending?.action.confirm?.cancelLabel}
        confirming={confirming}
        onConfirm={async () => {
          if (!pending) return
          const { action, row } = pending
          setConfirming(true)
          try {
            await action.onClick(row, resolvedListMutators)
            setPending(null)
          } catch (err) {
            // Leave `pending` set so the dialog stays open (matches CrudScreen's own
            // built-in delete flow) — the user sees the toast and can retry or cancel.
            toast.error(err instanceof Error ? err.message : `${action.label} failed`)
          } finally {
            setConfirming(false)
          }
        }}
      />
    </div>
  )
}

export type { CrudAction, CrudColumn, CrudSortState } from '@/components/crud/types'
