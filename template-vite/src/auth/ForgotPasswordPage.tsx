'use client'

import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  REQUEST_PASSWORD_RESET,
  type RequestPasswordResetResult,
} from '@/components/auth/auth-operations'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { toast } from '@/components/auth/notify'
import { setPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { ForgotPasswordFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

function go(path: string) {
  window.location.assign(path)
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // A stray visit here while a password-reset code is already pending goes
  // straight back to the verify step instead of re-requesting one.
  const pending = usePendingOtp()

  React.useEffect(() => {
    if (pending?.purpose === 'password_reset') go('/auth/verify-reset-otp')
  }, [pending])

  async function handleSubmit(values: ForgotPasswordFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<RequestPasswordResetResult>(REQUEST_PASSWORD_RESET, {
        input: { email: values.email },
      })
      setPendingOtp(values.email, 'password_reset', data.requestPasswordReset.otp)
      go('/auth/verify-reset-otp')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (pending?.purpose === 'password_reset') return null

  return (
    <>
      <AuthShell title="Forgot password" description="We’ll email you a 6-digit code to reset your password.">
        <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} error={error} />
      </AuthShell>
      <Toaster />
    </>
  )
}
