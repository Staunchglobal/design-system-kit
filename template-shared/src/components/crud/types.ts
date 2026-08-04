import type * as React from 'react'

export type CrudSortOrder = 'asc' | 'desc'

export type CrudSortState = {
  field: string
  order: CrudSortOrder
} | null

export type CrudColumn<T> = {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  mobileLabel?: string
  hideOnMobile?: boolean
  pairWith?: string
  className?: string
}

export type CrudActionConfirm = {
  title: string
  description: string
  confirmLabel?: string
  /** Label shown while the confirmed action is in flight. Defaults to "Deleting…" — set this for non-delete actions (e.g. "Archiving…"). */
  confirmingLabel?: string
  cancelLabel?: string
}

/**
 * Passed as a custom action's 2nd onClick argument (and available to
 * create/edit's `render` escape hatch) so a mutation's own response can
 * update the visible list directly — insert/replace/remove the one row
 * that changed — instead of the action re-fetching the whole page.
 */
export type CrudListMutators<T> = {
  insertItem: (item: T) => void
  replaceItem: (id: string, item: T) => void
  removeItem: (id: string) => void
}

export type CrudAction<T> = {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  onClick: (row: T, list: CrudListMutators<T>) => void | Promise<void>
  confirm?: CrudActionConfirm
  /** Per-row visibility (e.g. show "Archive" only on kept rows, "Restore" only on discarded ones). Defaults to always-visible. */
  isVisible?: (row: T) => boolean
}

export type CrudPageParams = {
  page: number
  pageSize: number
  search: string
  sort: CrudSortState
  tab: string | null
}

export type CrudPageResult<T> = {
  items: T[]
  totalCount: number
}

export type CrudTab = {
  label: string
  value: string
  count?: number
}

export type CrudFieldDef = {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'select'
  /** Required when `type: 'select'`. */
  options?: { value: string; label: string }[]
  required?: boolean
  maxLength?: number
  placeholder?: string
}

export type CrudEmptyConfig = {
  title?: string
  description?: string
  action?: React.ReactNode
}

export type CrudSearchConfig = {
  placeholder?: string
}

export type CrudFormRenderApi = {
  close: () => void
  visible: boolean
}

type CrudFormBase = {
  title: string
  description?: string
  submitLabel?: string
  /** Overrides the toolbar button's label (defaults to `Add ${entityLabel}`) — e.g. "Send invite" for a create flow that isn't literally adding a row of this entity. */
  addLabel?: string
  /** Overrides the success toast (defaults to `${entityLabel} created`/`updated`) — e.g. "Invitation sent". */
  successMessage?: string
}

export type CrudFormFieldsConfig<TValues extends Record<string, string> = Record<string, string>> =
  CrudFormBase & {
    fields: CrudFieldDef[]
    initialValues?: Partial<TValues>
    onSubmit: (values: TValues) => Promise<unknown> | unknown
  }

export type CrudFormCustomConfig = CrudFormBase & {
  render: (api: CrudFormRenderApi) => React.ReactNode
}

export type CrudCreateConfig<TItem, TValues extends Record<string, string> = Record<string, string>> =
  | (CrudFormFieldsConfig<TValues> & {
      // `void`/`undefined` means "don't insert into the current list" — the
      // created record doesn't belong on whatever page/tab is currently
      // showing (e.g. sending an invite while viewing the Active tab).
      onSubmit: (values: TValues) => Promise<TItem | void> | TItem | void
    })
  | CrudFormCustomConfig

export type CrudEditConfig<TItem, TValues extends Record<string, string> = Record<string, string>> =
  | (CrudFormBase & {
      fields: CrudFieldDef[]
      getValues?: (row: TItem) => TValues
      onSubmit: (values: TValues, row: TItem) => Promise<TItem> | TItem
      /** Per-row visibility for the built-in Edit action (e.g. hide it for rows that aren't a real editable entity, like a pending-invitation row mixed into the same table). Defaults to always-visible. */
      isVisible?: (row: TItem) => boolean
    })
  | (CrudFormBase & {
      render: (api: CrudFormRenderApi & { row: TItem }) => React.ReactNode
      isVisible?: (row: TItem) => boolean
    })

export type CrudDeleteConfig<TItem> = {
  getTitle?: (row: TItem) => string
  getDescription?: (row: TItem) => string
  confirmLabel?: string
  cancelLabel?: string
  onDelete: (row: TItem) => Promise<void> | void
}

export function isCrudFormFieldsConfig(
  config: CrudFormFieldsConfig | CrudFormCustomConfig
): config is CrudFormFieldsConfig {
  return 'fields' in config
}

export function isCrudEditFieldsConfig<TItem>(
  config: CrudEditConfig<TItem>
): config is Extract<CrudEditConfig<TItem>, { fields: CrudFieldDef[] }> {
  return 'fields' in config
}
