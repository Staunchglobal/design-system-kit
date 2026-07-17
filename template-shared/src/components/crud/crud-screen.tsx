'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { CrudDeleteDialog } from '@/components/crud/crud-delete-dialog'
import { CrudEntityFormDialog } from '@/components/crud/crud-entity-form-dialog'
import { CrudPagination } from '@/components/crud/crud-pagination'
import { CrudToolbar } from '@/components/crud/crud-toolbar'
import { useCrudList } from '@/components/crud/use-crud-list'
import type {
  CrudAction,
  CrudColumn,
  CrudCreateConfig,
  CrudDeleteConfig,
  CrudEditConfig,
  CrudEmptyConfig,
  CrudPageParams,
  CrudPageResult,
  CrudSearchConfig,
  CrudTab,
} from '@/components/crud/types'
import { isCrudEditFieldsConfig, isCrudFormFieldsConfig } from '@/components/crud/types'
import { DataTable } from '@/components/ui/crud-table'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

export type CrudScreenProps<T> = {
  columns: CrudColumn<T>[]
  fetchPage: (params: CrudPageParams) => Promise<CrudPageResult<T>>
  getRowId: (row: T) => string
  search?: CrudSearchConfig | false
  pageSize?: number
  pageSizeOptions?: number[]
  toolbar?: React.ReactNode
  tabs?: CrudTab[]
  initialTab?: string
  create?: CrudCreateConfig<T>
  edit?: CrudEditConfig<T>
  delete?: CrudDeleteConfig<T>
  empty?: CrudEmptyConfig
  /** Extra row actions beyond Edit/Delete from configs. */
  actions?: CrudAction<T>[]
  className?: string
  /** Mount a local Toaster (default true). Set false if the app already has one. */
  withToaster?: boolean
  /** Entity label used in default empty / toast copy. */
  entityLabel?: string
}

function defaultEditValues<T>(row: T, fieldNames: string[]): Record<string, string> {
  const record = row as Record<string, unknown>
  return Object.fromEntries(
    fieldNames.map((name) => [name, record[name] == null ? '' : String(record[name])])
  )
}

/**
 * Low-prop composed CRUD screen — owns search, tabs, table, pagination, and
 * create/edit/delete overlays. Pass columns + fetchPage + optional configs.
 */
export function CrudScreen<T>({
  columns,
  fetchPage,
  getRowId,
  search = {},
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  toolbar,
  tabs,
  initialTab,
  create,
  edit,
  delete: deleteConfig,
  empty,
  actions: extraActions,
  className,
  withToaster = true,
  entityLabel = 'item',
}: CrudScreenProps<T>) {
  const list = useCrudList<T>({
    fetchPage,
    getItemId: getRowId,
    pageSize,
    initialTab: initialTab ?? tabs?.[0]?.value ?? null,
  })

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<T | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<T | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const showSearch = search !== false

  const actions = React.useMemo(() => {
    const built: CrudAction<T>[] = []

    if (edit) {
      built.push({
        key: 'edit',
        label: 'Edit',
        variant: 'outline',
        onClick: (row) => setEditing(row),
      })
    }

    if (deleteConfig) {
      built.push({
        key: 'delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: (row) => setDeleteTarget(row),
      })
    }

    if (extraActions?.length) built.push(...extraActions)
    return built
  }, [edit, deleteConfig, extraActions])

  const emptyMessage =
    list.debouncedSearch
      ? `No ${entityLabel}s match your search.`
      : (empty?.description ?? `No ${entityLabel}s found.`)

  const handleDelete = async () => {
    if (!deleteTarget || !deleteConfig) return
    setDeleting(true)
    const row = deleteTarget
    const id = getRowId(row)

    try {
      const promise = Promise.resolve(deleteConfig.onDelete(row)).then(() => {
        list.removeItem(id)
      })

      await toast.promise(promise, {
        loading: `Deleting ${entityLabel}…`,
        success: `${entityLabel[0]!.toUpperCase()}${entityLabel.slice(1)} deleted`,
        error: (err: unknown) => (err instanceof Error ? err.message : 'Delete failed'),
      })

      setDeleteTarget(null)
    } catch {
      // toast.promise already surfaced the error
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={cn('w-full space-y-4', className)} data-slot="crud-screen">
      {withToaster ? <Toaster /> : null}

      <CrudToolbar
        showSearch={showSearch}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder={typeof search === 'object' ? search.placeholder : undefined}
        isSearchPending={list.isSearchPending}
        onAdd={create ? () => setCreateOpen(true) : undefined}
        addLabel={create && 'title' in create ? `Add ${entityLabel}` : 'Add'}
        toolbar={toolbar}
        tabs={tabs}
        activeTab={list.activeTab}
        onTabChange={list.setActiveTab}
      />

      {list.error ? (
        <div
          className="border-destructive/30 bg-destructive/5 text-destructive flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
          role="alert"
        >
          <span>{list.error.message}</span>
          <Button type="button" size="sm" variant="outline" onClick={list.refetch}>
            Retry
          </Button>
        </div>
      ) : null}

      {!list.loading &&
      list.items.length === 0 &&
      empty?.title &&
      !list.debouncedSearch ? (
        <div className="rounded-lg border px-6 py-10 text-center">
          <p className="text-sm font-medium">{empty.title}</p>
          {empty.description ? (
            <p className="text-muted-foreground mt-1 text-sm">{empty.description}</p>
          ) : null}
          {empty.action ? <div className="mt-4 flex justify-center">{empty.action}</div> : null}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={list.items}
          getRowId={getRowId}
          sortState={list.sort}
          onSortChange={list.setSort}
          isLoading={list.loading}
          emptyMessage={emptyMessage}
          actions={actions.length ? actions : undefined}
        />
      )}

      <CrudPagination
        page={list.page}
        pageCount={list.pageCount}
        onPageChange={list.setPage}
        totalCount={list.totalCount}
        totalLabel={
          list.debouncedSearch
            ? `${list.totalCount} ${entityLabel}${list.totalCount === 1 ? '' : 's'} matching “${list.debouncedSearch}”`
            : `${list.totalCount} ${entityLabel}${list.totalCount === 1 ? '' : 's'}`
        }
        pageSize={list.pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={list.setPageSize}
      />

      {/* Create */}
      {create && isCrudFormFieldsConfig(create) ? (
        <CrudEntityFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          title={create.title}
          description={create.description}
          submitLabel={create.submitLabel ?? `Create ${entityLabel}`}
          fields={create.fields}
          initialValues={create.initialValues as Record<string, string> | undefined}
          onSubmit={async (values) => {
            await toast.promise(
              Promise.resolve(create.onSubmit(values as never)).then((item) => {
                list.insertItem(item as T)
                return item
              }),
              {
                loading: `Creating ${entityLabel}…`,
                success: `${entityLabel[0]!.toUpperCase()}${entityLabel.slice(1)} created`,
                error: (err: unknown) => (err instanceof Error ? err.message : 'Create failed'),
              }
            )
          }}
        />
      ) : null}

      {create && !isCrudFormFieldsConfig(create)
        ? create.render({
            visible: createOpen,
            close: () => setCreateOpen(false),
          })
        : null}

      {/* Edit */}
      {edit && editing && isCrudEditFieldsConfig(edit) ? (
        <CrudEntityFormDialog
          open={editing != null}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          title={edit.title}
          description={edit.description}
          submitLabel={edit.submitLabel ?? 'Save changes'}
          fields={edit.fields}
          initialValues={
            edit.getValues
              ? (edit.getValues(editing) as Record<string, string>)
              : defaultEditValues(
                  editing,
                  edit.fields.map((f) => f.name)
                )
          }
          onSubmit={async (values) => {
            const row = editing
            await toast.promise(
              Promise.resolve(edit.onSubmit(values as never, row)).then((updated) => {
                list.replaceItem(getRowId(row), updated as T)
                return updated
              }),
              {
                loading: `Updating ${entityLabel}…`,
                success: `${entityLabel[0]!.toUpperCase()}${entityLabel.slice(1)} updated`,
                error: (err: unknown) => (err instanceof Error ? err.message : 'Update failed'),
              }
            )
          }}
        />
      ) : null}

      {edit && !isCrudEditFieldsConfig(edit) && editing
        ? edit.render({
            visible: true,
            close: () => setEditing(null),
            row: editing,
          })
        : null}

      {/* Delete */}
      {deleteConfig ? (
        <CrudDeleteDialog
          open={deleteTarget != null}
          onOpenChange={(open) => {
            if (!open && !deleting) setDeleteTarget(null)
          }}
          title={
            deleteTarget
              ? (deleteConfig.getTitle?.(deleteTarget) ?? `Delete this ${entityLabel}?`)
              : undefined
          }
          description={
            deleteTarget
              ? (deleteConfig.getDescription?.(deleteTarget) ??
                'This action cannot be undone.')
              : undefined
          }
          confirmLabel={deleteConfig.confirmLabel}
          cancelLabel={deleteConfig.cancelLabel}
          confirming={deleting}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  )
}
