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
  cancelLabel?: string
}

export type CrudAction<T> = {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  onClick: (row: T) => void | Promise<void>
  confirm?: CrudActionConfirm
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
  type?: 'text' | 'textarea'
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
      onSubmit: (values: TValues) => Promise<TItem> | TItem
    })
  | CrudFormCustomConfig

export type CrudEditConfig<TItem, TValues extends Record<string, string> = Record<string, string>> =
  | (CrudFormBase & {
      fields: CrudFieldDef[]
      getValues?: (row: TItem) => TValues
      onSubmit: (values: TValues, row: TItem) => Promise<TItem> | TItem
    })
  | (CrudFormBase & {
      render: (api: CrudFormRenderApi & { row: TItem }) => React.ReactNode
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
