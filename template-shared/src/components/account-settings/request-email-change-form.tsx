'use client'

import * as React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'
import { validateEmail, validateRequired } from '@/components/auth/password-policy'
import type { RequestEmailChangeValues } from '@/components/account-settings/use-email-change'

export type RequestEmailChangeFormProps = {
  onSubmit: (values: RequestEmailChangeValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
}

export function RequestEmailChangeForm({
  onSubmit,
  loading = false,
  error = null,
}: RequestEmailChangeFormProps) {
  const [newEmail, setNewEmail] = React.useState('')
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<{
    newEmail?: string
    currentPassword?: string
  }>({})
  const [submitted, setSubmitted] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const next: typeof fieldErrors = {}
    const emailErr = validateEmail(newEmail)
    if (emailErr) next.newEmail = emailErr
    const passwordErr = validateRequired(currentPassword, 'Current password')
    if (passwordErr) next.currentPassword = passwordErr
    setFieldErrors(next)
    if (Object.keys(next).length) return
    await onSubmit({ newEmail: newEmail.trim(), currentPassword })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldErrors.newEmail}>
          <FieldLabel htmlFor="new-email">New email</FieldLabel>
          <Input
            id="new-email"
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => {
              const value = e.target.value
              setNewEmail(value)
              if (submitted) {
                setFieldErrors((prev) => ({ ...prev, newEmail: validateEmail(value) ?? undefined }))
              }
            }}
            disabled={loading}
          />
          {submitted ? <FieldError>{fieldErrors.newEmail}</FieldError> : null}
        </Field>
        <Field data-invalid={submitted && !!fieldErrors.currentPassword}>
          <FieldLabel htmlFor="email-change-password">Current password</FieldLabel>
          <PasswordInput
            id="email-change-password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              const value = e.target.value
              setCurrentPassword(value)
              if (submitted) {
                setFieldErrors((prev) => ({
                  ...prev,
                  currentPassword: validateRequired(value, 'Current password') ?? undefined,
                }))
              }
            }}
            disabled={loading}
          />
          {submitted ? <FieldError>{fieldErrors.currentPassword}</FieldError> : null}
        </Field>
      </FieldGroup>
      <AuthSubmitButton loading={loading} loadingLabel="Sending code…">
        Continue
      </AuthSubmitButton>
    </form>
  )
}
