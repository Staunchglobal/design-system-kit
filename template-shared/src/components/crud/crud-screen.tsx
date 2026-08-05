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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

export type CrudScreenProps<T> = {
  columns: CrudColumn<T>[]
  fetchPage: (params: CrudPageParams) => Promise<CrudPageResult<T>>
  getRowId: (row: T) => string
  /** Page title rendered above the card. */
  title?: string
  description?: string
  search?: CrudSearchConfig | false
  pageSize?: number
  pageSizeOptions?: number[]
  toolbar?: React.ReactNode
  tabs?: CrudTab[]
  initialTab?: string
  /** Controlled tab value (e.g. from a route segment) — pair with `onTabChange`. Omit both to let CrudScreen manage the tab as internal state. */
  activeTab?: string
  onTabChange?: (tab: string) => void
  create?: CrudCreateConfig<T>
  edit?: CrudEditConfig<T>
  delete?: CrudDeleteConfig<T>
  empty?: CrudEmptyConfig
  actions?: CrudAction<T>[]
  className?: string
  withToaster?: boolean
  entityLabel?: string
}

function defaultEditValues<T>(row: T, fieldNames: string[]): Record<string, string> {
  const record = row as Record<string, unknown>
  return Object.fromEntries(
    fieldNames.map((name) => [name, record[name] == null ? '' : String(record[name])])
  )
}

export function CrudScreen<T>({
  columns,
  fetchPage,
  getRowId,
  title,
  description,
  search = {},
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  toolbar,
  tabs,
  initialTab,
  activeTab: activeTabProp,
  onTabChange: onTabChangeProp,
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
    activeTab: activeTabProp,
    onTabChange: onTabChangeProp,
  })

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<T | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<T | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const showSearch = search !== false

  const listMutators = React.useMemo(
    () => ({ insertItem: list.insertItem, replaceItem: list.replaceItem, removeItem: list.removeItem }),
    [list.insertItem, list.replaceItem, list.removeItem]
  )

  const actions = React.useMemo(() => {
    const built: CrudAction<T>[] = []

    if (edit) {
      built.push({
        key: 'edit',
        label: 'Edit',
        variant: 'outline',
        isVisible: edit.isVisible,
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

  const addLabel = create ? (create.addLabel ?? `Add ${entityLabel}`) : 'Add'
  const openCreate = create ? () => setCreateOpen(true) : undefined
  // When a page title is provided, the create CTA lives in the header —
  // the toolbar keeps search/filters only.
  const addInHeader = Boolean(title && openCreate)

  return (
    <div className={cn('w-full', className)} data-slot="crud-page">
      {withToaster ? <Toaster /> : null}

      {title ? (
        <header data-slot="crud-header">
          <div data-slot="crud-header-copy">
            <div data-slot="crud-header-title-row">
              <h2 data-slot="crud-header-title">{title}</h2>
              {/* Always render so the count badge doesn't shift the title on fetch. */}
              <Badge
                variant="secondary"
                className={cn(
                  'border-border tabular-nums',
                  list.totalCount <= 0 && 'invisible'
                )}
                aria-hidden={list.totalCount <= 0 || undefined}
              >
                {list.totalCount > 0 ? list.totalCount : 0}
              </Badge>
            </div>
            {description ? (
              <p data-slot="crud-header-description">{description}</p>
            ) : null}
          </div>
          {addInHeader ? (
            <div data-slot="crud-header-actions">
              <Button type="button" size="sm" onClick={openCreate}>
                <Plus />
                {addLabel}
              </Button>
            </div>
          ) : null}
        </header>
      ) : null}

      <div data-slot="crud-screen">
        <CrudToolbar
          showSearch={showSearch}
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder={typeof search === 'object' ? search.placeholder : undefined}
          isSearchPending={list.isSearchPending}
          onAdd={addInHeader ? undefined : openCreate}
          addLabel={addLabel}
          toolbar={toolbar}
          tabs={tabs}
          activeTab={list.activeTab}
          onTabChange={list.setActiveTab}
        />

        {list.error ? (
          <div
            className="border-destructive/30 bg-destructive/5 text-destructive m-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
            role="alert"
          >
            <span>{list.error.message}</span>
            <Button type="button" size="sm" variant="outline" onClick={list.refetch}>
              Retry
            </Button>
          </div>
        ) : null}

        {/*
          Keep DataTable mounted across tab/filter fetches. Swapping it for the
          empty card (or remounting on URL changes) is what made the table
          flash/glitch on every tab click.
        */}
        <DataTable
          columns={columns}
          data={list.items}
          getRowId={getRowId}
          sortState={list.sort}
          onSortChange={list.setSort}
          // Only the first paint uses a loading empty state. Tab/filter refetches
          // keep the previous rows until the new page arrives — no height bounce.
          isLoading={list.loading}
          emptyMessage={
            list.loading
              ? 'Loading…'
              : list.debouncedSearch
                ? emptyMessage
                : (empty?.title ?? emptyMessage)
          }
          actions={actions.length ? actions : undefined}
          listMutators={listMutators}
        />

        <CrudPagination
          page={list.page}
          pageCount={list.pageCount}
          onPageChange={list.setPage}
          pageSize={list.pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={list.setPageSize}
        />
      </div>
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
                // `void`/`undefined` means the created record doesn't belong on
                // whatever page/tab is currently showing — skip inserting it.
                if (item != null) list.insertItem(item as T)
                return item
              }),
              {
                loading: `Creating ${entityLabel}…`,
                success: create.successMessage ?? `${entityLabel[0]!.toUpperCase()}${entityLabel.slice(1)} created`,
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
                success: edit.successMessage ?? `${entityLabel[0]!.toUpperCase()}${entityLabel.slice(1)} updated`,
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
