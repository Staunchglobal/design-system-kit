'use client'

import * as React from 'react'

import { CrudFormDialog } from '@/components/crud/crud-form-dialog'
import {
  CrudFormFields,
  emptyValuesFromFields,
  validateCrudFields,
} from '@/components/crud/crud-form-fields'
import type { CrudFieldDef } from '@/components/crud/types'

export type CrudEntityFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  submitLabel?: string
  fields: CrudFieldDef[]
  initialValues?: Record<string, string>
  onSubmit: (values: Record<string, string>) => Promise<void> | void
}

export function CrudEntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  fields,
  initialValues,
  onSubmit,
}: CrudEntityFormDialogProps) {
  const [values, setValues] = React.useState<Record<string, string>>(() => ({
    ...emptyValuesFromFields(fields),
    ...initialValues,
  }))
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setValues({ ...emptyValuesFromFields(fields), ...initialValues })
      setFieldErrors({})
      setFormError(null)
      setSubmitting(false)
    }
  }

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      submitLabel={submitLabel}
      submitting={submitting}
      error={formError}
      onSubmit={async () => {
        const errors = validateCrudFields(fields, values)
        setFieldErrors(errors)
        if (Object.keys(errors).length) return

        setSubmitting(true)
        setFormError(null)
        try {
          await onSubmit(values)
          onOpenChange(false)
        } catch (err) {
          setFormError(err instanceof Error ? err.message : 'Request failed')
        } finally {
          setSubmitting(false)
        }
      }}
    >
      <CrudFormFields
        fields={fields}
        values={values}
        errors={fieldErrors}
        onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
      />
    </CrudFormDialog>
  )
}
