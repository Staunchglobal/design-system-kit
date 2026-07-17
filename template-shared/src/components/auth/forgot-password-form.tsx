'use client'

import * as React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { validateEmail } from '@/components/auth/password-policy'
import type { ForgotPasswordFormValues } from '@/components/auth/types'

export type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordFormValues) => void | Promise<void>
  loading?: boolean
  error?: string | null
  loginHref?: string
  LinkComponent?: React.ElementType
}

export function ForgotPasswordForm({
  onSubmit,
  loading = false,
  error = null,
  loginHref = '/auth/login',
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
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldError}>
          <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              const value = e.target.value
              setEmail(value)
              if (submitted) setFieldError(validateEmail(value))
            }}
            disabled={loading}
          />
          {submitted ? <FieldError>{fieldError}</FieldError> : null}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send reset code'}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        <Link href={loginHref} className="text-foreground font-medium underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
