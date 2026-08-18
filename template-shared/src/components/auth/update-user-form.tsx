'use client'

import * as React from 'react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { validateRequired } from '@/components/auth/password-policy'
import type { UpdateUserFormValues } from '@/components/auth/types'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export type UpdateUserFormProps = {
  onSubmit: (values: UpdateUserFormValues) => void | Promise<void>
  defaultFirstName?: string
  defaultLastName?: string
  loading?: boolean
  error?: string | null
}

export function UpdateUserForm({
  onSubmit,
  defaultFirstName = '',
  defaultLastName = '',
  loading = false,
  error = null,
}: UpdateUserFormProps) {
  const [firstName, setFirstName] = React.useState(defaultFirstName)
  const [lastName, setLastName] = React.useState(defaultLastName)
  // Both fields are individually optional (the backend does a partial
  // update), but submitting with neither filled in is never useful — this
  // catches that client-side instead of round-tripping to hit the
  // backend's own "Nothing to update." error.
  const [formError, setFormError] = React.useState<string | undefined>()
  const [submitted, setSubmitted] = React.useState(false)

  function validate(first: string, last: string) {
    if (!validateRequired(first, 'First name') && !validateRequired(last, 'Last name')) return undefined
    return 'Enter a first name, a last name, or both'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const err = validate(firstName, lastName)
    setFormError(err)
    if (err) return
    await onSubmit({ firstName: firstName.trim(), lastName: lastName.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <AuthFormError message={error ?? (submitted ? formError : undefined)} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="update-user-first-name">First name</FieldLabel>
          <Input
            id="update-user-first-name"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => {
              const value = e.target.value
              setFirstName(value)
              if (submitted) setFormError(validate(value, lastName))
            }}
            disabled={loading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="update-user-last-name">Last name</FieldLabel>
          <Input
            id="update-user-last-name"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => {
              const value = e.target.value
              setLastName(value)
              if (submitted) setFormError(validate(firstName, value))
            }}
            disabled={loading}
          />
        </Field>
      </FieldGroup>
      <AuthSubmitButton loading={loading} loadingLabel="Saving…">
        Save name
      </AuthSubmitButton>
    </form>
  )
}
