'use client'

import * as React from 'react'

import type { CrudFieldDef } from '@/components/crud/types'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function validateCrudFields(
  fields: CrudFieldDef[],
  values: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const raw = values[field.name] ?? ''
    const value = raw.trim()
    if (field.required && !value) {
      errors[field.name] = `${field.label} is required`
      continue
    }
    if (field.maxLength != null && raw.length > field.maxLength) {
      errors[field.name] = `${field.label} must be ${field.maxLength} characters or fewer`
    }
  }
  return errors
}

export function emptyValuesFromFields(fields: CrudFieldDef[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.name, '']))
}

export type CrudFormFieldsProps = {
  fields: CrudFieldDef[]
  values: Record<string, string>
  onChange: (name: string, value: string) => void
  errors?: Record<string, string>
  idPrefix?: string
}

/** Renders declarative CrudFieldDef list with kit Field/Input/Textarea. */
export function CrudFormFields({
  fields,
  values,
  onChange,
  errors = {},
  idPrefix = 'crud-field',
}: CrudFormFieldsProps) {
  return (
    <>
      {fields.map((field) => {
        const id = `${idPrefix}-${field.name}`
        const error = errors[field.name]
        const value = values[field.name] ?? ''

        return (
          <Field key={field.name} data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            {field.type === 'textarea' ? (
              <Textarea
                id={id}
                value={value}
                placeholder={field.placeholder}
                required={field.required}
                maxLength={field.maxLength}
                rows={4}
                aria-invalid={Boolean(error)}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            ) : (
              <Input
                id={id}
                value={value}
                placeholder={field.placeholder}
                required={field.required}
                maxLength={field.maxLength}
                aria-invalid={Boolean(error)}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            )}
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
        )
      })}
    </>
  )
}
