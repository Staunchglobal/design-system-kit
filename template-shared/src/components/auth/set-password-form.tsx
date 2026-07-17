'use client'

import * as React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { PasswordInput } from '@/components/auth/password-input'
import { PasswordRequirementErrors } from '@/components/auth/password-requirement-errors'
import {
  PASSWORD_POLICY_MESSAGE,
  getPasswordRequirementErrors,
  validatePasswordConfirmation,
} from '@/components/auth/password-policy'
import type { SetPasswordFormValues } from '@/components/auth/types'

export type SetPasswordFormProps = {
  onSubmit: (values: SetPasswordFormValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
  submitLabel?: string
  titleHint?: string
}

export function SetPasswordForm({
  onSubmit,
  loading = false,
  error = null,
  submitLabel = 'Set password',
}: SetPasswordFormProps) {
  const [password, setPassword] = React.useState('')
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<{
    password?: string[]
    passwordConfirmation?: string
  }>({})
  const [submitted, setSubmitted] = React.useState(false)

  function passwordErrorsFor(value: string) {
    const errors = getPasswordRequirementErrors(value)
    return errors.length ? errors : undefined
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const next: typeof fieldErrors = {}
    const pwErrors = passwordErrorsFor(password)
    if (pwErrors) next.password = pwErrors
    const confirmErr = validatePasswordConfirmation(password, passwordConfirmation)
    if (confirmErr) next.passwordConfirmation = confirmErr
    setFieldErrors(next)
    if (Object.keys(next).length) return
    await onSubmit({ password, passwordConfirmation })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldErrors.password?.length}>
          <FieldLabel htmlFor="set-password">New password</FieldLabel>
          <PasswordInput
            id="set-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              const value = e.target.value
              setPassword(value)
              if (submitted) {
                setFieldErrors((prev) => ({
                  ...prev,
                  password: passwordErrorsFor(value),
                  passwordConfirmation:
                    validatePasswordConfirmation(value, passwordConfirmation) ?? undefined,
                }))
              }
            }}
            disabled={loading}
          />
          <FieldDescription>{PASSWORD_POLICY_MESSAGE}</FieldDescription>
          {submitted ? <PasswordRequirementErrors errors={fieldErrors.password ?? []} /> : null}
        </Field>
        <Field data-invalid={submitted && !!fieldErrors.passwordConfirmation}>
          <FieldLabel htmlFor="set-confirm">Confirm password</FieldLabel>
          <PasswordInput
            id="set-confirm"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => {
              const value = e.target.value
              setPasswordConfirmation(value)
              if (submitted) {
                setFieldErrors((prev) => ({
                  ...prev,
                  passwordConfirmation: validatePasswordConfirmation(password, value) ?? undefined,
                }))
              }
            }}
            disabled={loading}
          />
          {submitted ? <FieldError>{fieldErrors.passwordConfirmation}</FieldError> : null}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
