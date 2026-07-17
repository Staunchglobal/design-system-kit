'use client'

import * as React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/auth/password-input'
import { validateEmail, validateLoginPassword } from '@/components/auth/password-policy'
import type { LoginFormValues } from '@/components/auth/types'

export type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
  defaultEmail?: string
  forgotPasswordHref?: string
  signupHref?: string
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
  LinkComponent = 'a',
}: LoginFormProps) {
  const Link = LinkComponent
  const [email, setEmail] = React.useState(defaultEmail)
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<FieldKey, string>>>({})
  /** Errors stay hidden until the first submit attempt, then update live while typing. */
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
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldErrors.email}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
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
            aria-invalid={submitted && !!fieldErrors.email}
          />
          {submitted ? <FieldError>{fieldErrors.email}</FieldError> : null}
        </Field>
        <Field data-invalid={submitted && !!fieldErrors.password}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <Link
              href={forgotPasswordHref}
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
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
            disabled={loading}
            aria-invalid={submitted && !!fieldErrors.password}
          />
          {submitted ? <FieldError>{fieldErrors.password}</FieldError> : null}
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="login-remember"
            checked={rememberMe}
            onCheckedChange={(c) => setRememberMe(c === true)}
            disabled={loading}
          />
          <FieldLabel htmlFor="login-remember" className="font-normal">
            Remember me
          </FieldLabel>
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href={signupHref} className="text-foreground font-medium underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
