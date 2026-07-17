'use client'

import * as React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/auth/password-input'
import { PasswordRequirementErrors } from '@/components/auth/password-requirement-errors'
import {
  PASSWORD_POLICY_MESSAGE,
  getPasswordRequirementErrors,
  validateEmail,
  validatePasswordConfirmation,
  validateRequired,
} from '@/components/auth/password-policy'
import type { SignupFormValues } from '@/components/auth/types'

export type SignupFormProps = {
  onSubmit: (values: SignupFormValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
  loginHref?: string
  LinkComponent?: React.ElementType
}

export function SignupForm({
  onSubmit,
  loading = false,
  error = null,
  loginHref = '/auth/login',
  LinkComponent = 'a',
}: SignupFormProps) {
  const Link = LinkComponent
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('')
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<{
    firstName?: string
    lastName?: string
    email?: string
    password?: string[]
    passwordConfirmation?: string
    termsAccepted?: string
  }>({})
  /** Errors stay hidden until the first submit attempt, then update live while typing. */
  const [submitted, setSubmitted] = React.useState(false)

  function passwordErrorsFor(value: string) {
    const errors = getPasswordRequirementErrors(value)
    return errors.length ? errors : undefined
  }

  function validateAll() {
    const next: typeof fieldErrors = {}
    const firstErr = validateRequired(firstName, 'First name')
    if (firstErr) next.firstName = firstErr
    const lastErr = validateRequired(lastName, 'Last name')
    if (lastErr) next.lastName = lastErr
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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      passwordConfirmation,
      termsAccepted,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={submitted && !!fieldErrors.firstName}>
            <FieldLabel htmlFor="signup-first">First name</FieldLabel>
            <Input
              id="signup-first"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => {
                const value = e.target.value
                setFirstName(value)
                if (submitted) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    firstName: validateRequired(value, 'First name') ?? undefined,
                  }))
                }
              }}
              disabled={loading}
            />
            {submitted ? <FieldError>{fieldErrors.firstName}</FieldError> : null}
          </Field>
          <Field data-invalid={submitted && !!fieldErrors.lastName}>
            <FieldLabel htmlFor="signup-last">Last name</FieldLabel>
            <Input
              id="signup-last"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => {
                const value = e.target.value
                setLastName(value)
                if (submitted) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    lastName: validateRequired(value, 'Last name') ?? undefined,
                  }))
                }
              }}
              disabled={loading}
            />
            {submitted ? <FieldError>{fieldErrors.lastName}</FieldError> : null}
          </Field>
        </div>
        <Field data-invalid={submitted && !!fieldErrors.email}>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
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
            disabled={loading}
          />
          {submitted ? <FieldError>{fieldErrors.email}</FieldError> : null}
        </Field>
        <Field data-invalid={submitted && !!fieldErrors.password?.length}>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <PasswordInput
            id="signup-password"
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
          <FieldLabel htmlFor="signup-confirm">Confirm password</FieldLabel>
          <PasswordInput
            id="signup-confirm"
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
            disabled={loading}
          />
          <FieldLabel htmlFor="signup-terms" className="font-normal">
            I agree to the terms and conditions
          </FieldLabel>
        </Field>
        {submitted ? <FieldError>{fieldErrors.termsAccepted}</FieldError> : null}
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link href={loginHref} className="text-foreground font-medium underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
