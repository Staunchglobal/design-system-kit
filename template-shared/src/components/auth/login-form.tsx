'use client'

import * as React from 'react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'
import { validateEmail, validateLoginPassword } from '@/components/auth/password-policy'
import type { LoginFormValues } from '@/components/auth/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
  defaultEmail?: string
  forgotPasswordHref?: string
  signupHref?: string
  /** When false, omit the bottom sign-up link (e.g. when AuthShell description already has it). */
  showSignupLink?: boolean
  LinkComponent?: React.ElementType
}

type FieldKey = 'email' | 'password'

export function LoginForm({
  onSubmit,
  loading = false,
  error = null,
  defaultEmail = '',
  forgotPasswordHref = '/auth/forgot-password',
  signupHref = '/auth/signup',
  showSignupLink = true,
  LinkComponent = 'a',
}: LoginFormProps) {
  const Link = LinkComponent
  const [email, setEmail] = React.useState(defaultEmail)
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<FieldKey, string>>>({})
  const [submitted, setSubmitted] = React.useState(false)

  function validateAll(nextEmail = email, nextPassword = password) {
    const next: Partial<Record<FieldKey, string>> = {}
    const emailErr = validateEmail(nextEmail)
    if (emailErr) next.email = emailErr
    const passwordErr = validateLoginPassword(nextPassword)
    if (passwordErr) next.password = passwordErr
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const next = validateAll()
    setFieldErrors(next)
    if (Object.keys(next).length) return
    await onSubmit({ email: email.trim(), password, rememberMe })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <AuthFormError message={error} />
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldErrors.email}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
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
        <Field data-invalid={submitted && !!fieldErrors.password}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              const value = e.target.value
              setPassword(value)
              if (submitted) {
                setFieldErrors((prev) => ({
                  ...prev,
                  password: validateLoginPassword(value) ?? undefined,
                }))
              }
            }}
            aria-invalid={submitted && !!fieldErrors.password}
          />
          {submitted ? <FieldError>{fieldErrors.password}</FieldError> : null}
          <Link
            href={forgotPasswordHref}
            className="text-primary hover:text-primary/80 text-sm underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="login-remember"
            checked={rememberMe}
            onCheckedChange={(c) => setRememberMe(c === true)}
          />
          <FieldLabel htmlFor="login-remember" className="font-normal">
            Remember me
          </FieldLabel>
        </Field>
      </FieldGroup>
      <AuthSubmitButton loading={loading} loadingLabel="Signing in…">
        Sign in
      </AuthSubmitButton>
      {showSignupLink ? (
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href={signupHref} className="text-primary font-medium underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      ) : null}
    </form>
  )
}
