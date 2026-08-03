'use client'

import * as React from 'react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'
import { PasswordRequirementErrors } from '@/components/auth/password-requirement-errors'
import {
  PASSWORD_POLICY_MESSAGE,
  getPasswordRequirementErrors,
  validatePasswordConfirmation,
  validateRequired,
} from '@/components/auth/password-policy'
import type { ChangePasswordFormValues } from '@/components/auth/types'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

export type ChangePasswordFormProps = {
  onSubmit: (values: ChangePasswordFormValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
}

export function ChangePasswordForm({
  onSubmit,
  loading = false,
  error = null,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<{
    currentPassword?: string
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
    const currentErr = validateRequired(currentPassword, 'Current password')
    if (currentErr) next.currentPassword = currentErr
    const pwErrors = passwordErrorsFor(password)
    if (pwErrors) next.password = pwErrors
    const confirmErr = validatePasswordConfirmation(password, passwordConfirmation)
    if (confirmErr) next.passwordConfirmation = confirmErr
    setFieldErrors(next)
    if (Object.keys(next).length) return
    await onSubmit({ currentPassword, password, passwordConfirmation })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <AuthFormError message={error} />
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldErrors.currentPassword}>
          <FieldLabel htmlFor="change-current">Current password</FieldLabel>
          <PasswordInput
            id="change-current"
            autoComplete="current-password"
            placeholder="Enter current password"
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
            aria-invalid={submitted && !!fieldErrors.currentPassword}
          />
          {submitted ? <FieldError>{fieldErrors.currentPassword}</FieldError> : null}
        </Field>
        <Field data-invalid={submitted && !!fieldErrors.password?.length}>
          <FieldLabel htmlFor="change-new">New password</FieldLabel>
          <PasswordInput
            id="change-new"
            autoComplete="new-password"
            placeholder="Create a new password"
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
            aria-invalid={submitted && !!fieldErrors.password?.length}
          />
          <FieldDescription>{PASSWORD_POLICY_MESSAGE}</FieldDescription>
          {submitted ? <PasswordRequirementErrors errors={fieldErrors.password ?? []} /> : null}
        </Field>
        <Field data-invalid={submitted && !!fieldErrors.passwordConfirmation}>
          <FieldLabel htmlFor="change-confirm">Confirm new password</FieldLabel>
          <PasswordInput
            id="change-confirm"
            autoComplete="new-password"
            placeholder="Confirm new password"
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
            aria-invalid={submitted && !!fieldErrors.passwordConfirmation}
          />
          {submitted ? <FieldError>{fieldErrors.passwordConfirmation}</FieldError> : null}
        </Field>
      </FieldGroup>
      <AuthSubmitButton loading={loading} loadingLabel="Updating…">
        Update password
      </AuthSubmitButton>
    </form>
  )
}
