'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, EllipsisVertical } from 'lucide-react'
import { toast } from 'sonner'

import { CrudDeleteDialog } from '@/components/crud/crud-delete-dialog'
import type { CrudAction, CrudColumn, CrudListMutators, CrudSortState } from '@/components/crud/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  /** Adds a top border to the header row — set when a toolbar renders directly above this table (e.g. CrudScreen) to avoid a double edge; leave false when the table is the first child of its container. */
  headerTopBorder?: boolean
}

const CRUD_TABLE_HEAD_CLASS =
  'text-muted-600 h-10 px-3 py-3.5 align-middle font-medium text-xs tracking-[0.075em] leading-none whitespace-nowrap uppercase bg-transparent'
const CRUD_TABLE_CELL_CLASS = 'px-3 py-2 min-h-12 align-middle text-sm text-foreground'
const CRUD_TABLE_ROW_CLASS = 'border-border hover:bg-neutral-50 dark:hover:bg-neutral-900'
const CRUD_DROPDOWN_ITEM_CLASS =
  'px-3 py-2 gap-3 font-medium data-[variant=destructive]:focus:bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] dark:data-[variant=destructive]:focus:bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)]'

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
  const [open, setOpen] = React.useState(false)

  if (visibleActions.length === 0) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Row actions"
          data-slot="crud-row-actions-trigger"
          disabled={pendingKey != null}
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        data-ui="crud-row-actions-menu"
        // Override the shared menu's trigger-width sizing — icon triggers
        // would otherwise collapse the panel to ~32px.
        className="w-auto min-w-44 shadow-(--shadow-sm) ring-border"
      >
        {visibleActions.map((action) => {
          const destructive = action.variant === 'destructive' || Boolean(action.confirm)
          return (
            <DropdownMenuItem
              key={action.key}
              variant={destructive ? 'destructive' : 'default'}
              disabled={pendingKey === action.key}
              className={CRUD_DROPDOWN_ITEM_CLASS}
              onSelect={(e) => {
                if (action.confirm) {
                  onConfirmRequest(action, row)
                  return
                }
                // Keep the menu open while the async action runs so the pending label is visible.
                e.preventDefault()
                void (async () => {
                  setPendingKey(action.key)
                  try {
                    await action.onClick(row, listMutators)
                    setOpen(false)
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : `${action.label} failed`)
                  } finally {
                    setPendingKey(null)
                  }
                })()
              }}
            >
              {action.icon}
              {pendingKey === action.key ? `${action.label}…` : action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
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
  const hasActions = Boolean(actions?.length)

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-8 text-center text-sm">
        {isLoading ? 'Loading…' : emptyMessage}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((row) => {
        const rendered = new Set<string>()
        return (
          <div
            key={getRowId(row)}
            className={cn(
              'bg-card relative mx-3 space-y-3 rounded-lg border p-4 first:mt-3 last:mb-3',
              hasActions && 'pt-12'
            )}
            data-slot="crud-mobile-card"
          >
            {hasActions ? (
              <div className="absolute top-3 right-3">
                <ActionButtons
                  actions={actions!}
                  row={row}
                  onConfirmRequest={onConfirmRequest}
                  listMutators={listMutators}
                />
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
      <div
        data-ui="crud-mobile-label"
        className="text-muted-600 text-xs font-medium tracking-[0.075em] uppercase"
      >
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
  headerTopBorder,
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
  headerTopBorder?: boolean
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
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-neutral-0 dark:bg-neutral-950">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={cn(CRUD_TABLE_ROW_CLASS, headerTopBorder && 'border-t')}
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    CRUD_TABLE_HEAD_CLASS,
                    header.column.id === '__actions' && 'w-12 text-end'
                  )}
                >
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
              <TableRow key={row.id} className={CRUD_TABLE_ROW_CLASS}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      CRUD_TABLE_CELL_CLASS,
                      cell.column.id === '__actions' ? 'w-12 text-end' : 'whitespace-normal'
                    )}
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
  headerTopBorder = false,
}: DataTableProps<T>) {
  const isMobile = useIsMobile()
  const resolvedListMutators = listMutators ?? noopListMutators<T>()
  const [pending, setPending] = React.useState<{ action: CrudAction<T>; row: T } | null>(null)
  const [confirming, setConfirming] = React.useState(false)

  const onConfirmRequest = React.useCallback((action: CrudAction<T>, row: T) => {
    setPending({ action, row })
  }, [])

  return (
    <div
      className={cn('bg-neutral-0 dark:bg-neutral-950 relative w-full', className)}
      data-slot="crud-table"
      aria-busy={isLoading || undefined}
    >
      {isMobile ? (
        <MobileCards
          columns={columns}
          data={data}
          getRowId={getRowId}
          actions={actions}
          emptyMessage={isLoading && data.length === 0 ? 'Loading…' : emptyMessage}
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
          headerTopBorder={headerTopBorder}
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
