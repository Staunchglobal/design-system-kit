'use client'

import * as React from 'react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { validateEmail } from '@/components/auth/password-policy'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export type NewEmailFormProps = {
  onSubmit: (newEmail: string) => void | Promise<void>
  loading?: boolean
  error?: string | null
}

export function NewEmailForm({ onSubmit, loading = false, error = null }: NewEmailFormProps) {
  const [newEmail, setNewEmail] = React.useState('')
  const [fieldError, setFieldError] = React.useState<string | undefined>()
  const [submitted, setSubmitted] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const err = validateEmail(newEmail) ?? undefined
    setFieldError(err)
    if (err) return
    await onSubmit(newEmail.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <AuthFormError message={error} />
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldError}>
          <FieldLabel htmlFor="new-email">New email</FieldLabel>
          <Input
            id="new-email"
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => {
              const value = e.target.value
              setNewEmail(value)
              if (submitted) setFieldError(validateEmail(value) ?? undefined)
            }}
            disabled={loading}
          />
          {submitted ? <FieldError>{fieldError}</FieldError> : null}
        </Field>
      </FieldGroup>
      <AuthSubmitButton loading={loading} loadingLabel="Sending code…">
        Continue
      </AuthSubmitButton>
    </form>
  )
}
