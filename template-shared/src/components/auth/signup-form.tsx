'use client'

import * as React from 'react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'
import { PasswordRequirementErrors } from '@/components/auth/password-requirement-errors'
import {
  PASSWORD_POLICY_MESSAGE,
  getPasswordRequirementErrors,
  validateEmail,
  validatePasswordConfirmation,
} from '@/components/auth/password-policy'
import type { SignupFormValues } from '@/components/auth/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export type SignupFormProps = {
  onSubmit: (values: SignupFormValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
  loginHref?: string
  showLoginLink?: boolean
  LinkComponent?: React.ElementType
}

export function SignupForm({
  onSubmit,
  loading = false,
  error = null,
  loginHref = '/login',
  showLoginLink = true,
  LinkComponent = 'a',
}: SignupFormProps) {
  const Link = LinkComponent
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('')
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<{
    email?: string
    password?: string[]
    passwordConfirmation?: string
    termsAccepted?: string
  }>({})
  const [submitted, setSubmitted] = React.useState(false)

  function passwordErrorsFor(value: string) {
    const errors = getPasswordRequirementErrors(value)
    return errors.length ? errors : undefined
  }

  function validateAll() {
    const next: typeof fieldErrors = {}
    const emailErr = validateEmail(email)
    if (emailErr) next.email = emailErr
    const pwErrors = passwordErrorsFor(password)
    if (pwErrors) next.password = pwErrors
    const confirmErr = validatePasswordConfirmation(password, passwordConfirmation)
    if (confirmErr) next.passwordConfirmation = confirmErr
    if (!termsAccepted) next.termsAccepted = 'You must accept the terms'
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const next = validateAll()
    setFieldErrors(next)
    if (Object.keys(next).length) return
    await onSubmit({
      email: email.trim(),
      password,
      passwordConfirmation,
      termsAccepted,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <AuthFormError message={error} />
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldErrors.email}>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              const value = e.target.value
              setEmail(value)
              if (submitted) {
                setFieldErrors((prev) => ({
                  ...prev,
                  email: validateEmail(value) ?? undefined,
                }))
              }
            }}
            aria-invalid={submitted && !!fieldErrors.email}
          />
          {submitted ? <FieldError>{fieldErrors.email}</FieldError> : null}
        </Field>
        <Field data-invalid={submitted && !!fieldErrors.password?.length}>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <PasswordInput
            id="signup-password"
            autoComplete="new-password"
            placeholder="Create a password"
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
          <FieldLabel htmlFor="signup-confirm">Confirm password</FieldLabel>
          <PasswordInput
            id="signup-confirm"
            autoComplete="new-password"
            placeholder="Confirm your password"
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
        <Field orientation="horizontal" data-invalid={submitted && !!fieldErrors.termsAccepted}>
          <Checkbox
            id="signup-terms"
            checked={termsAccepted}
            onCheckedChange={(c) => {
              const value = c === true
              setTermsAccepted(value)
              if (submitted) {
                setFieldErrors((prev) => ({
                  ...prev,
                  termsAccepted: value ? undefined : 'You must accept the terms',
                }))
              }
            }}
            aria-invalid={submitted && !!fieldErrors.termsAccepted}
          />
          <FieldLabel htmlFor="signup-terms" className="font-normal">
            I agree to the terms and conditions
          </FieldLabel>
        </Field>
        {submitted ? <FieldError>{fieldErrors.termsAccepted}</FieldError> : null}
      </FieldGroup>
      <AuthSubmitButton loading={loading} loadingLabel="Creating account…">
        Create account
      </AuthSubmitButton>
      {showLoginLink ? (
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link href={loginHref} className="text-primary font-medium underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      ) : null}
    </form>
  )
}
