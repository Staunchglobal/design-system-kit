'use client'

import * as React from 'react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { validateEmail } from '@/components/auth/password-policy'
import type { ForgotPasswordFormValues } from '@/components/auth/types'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordFormValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
  loginHref?: string
  showLoginLink?: boolean
  LinkComponent?: React.ElementType
}

export function ForgotPasswordForm({
  onSubmit,
  loading = false,
  error = null,
  loginHref = '/auth/login',
  showLoginLink = true,
  LinkComponent = 'a',
}: ForgotPasswordFormProps) {
  const Link = LinkComponent
  const [email, setEmail] = React.useState('')
  const [fieldError, setFieldError] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const err = validateEmail(email)
    setFieldError(err)
    if (err) return
    await onSubmit({ email: email.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <AuthFormError message={error} />
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldError}>
          <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              const value = e.target.value
              setEmail(value)
              if (submitted) setFieldError(validateEmail(value))
            }}
            aria-invalid={submitted && !!fieldError}
          />
          {submitted ? <FieldError>{fieldError}</FieldError> : null}
        </Field>
      </FieldGroup>
      <AuthSubmitButton loading={loading} loadingLabel="Sending…">
        Send reset code
      </AuthSubmitButton>
      {showLoginLink ? (
        <p className="text-muted-foreground text-center text-sm">
          <Link href={loginHref} className="text-primary font-medium underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      ) : null}
    </form>
  )
}
