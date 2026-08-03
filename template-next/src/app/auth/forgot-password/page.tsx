'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthBackLink } from '@/components/auth/auth-back-link'
import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  REQUEST_PASSWORD_RESET,
  type RequestPasswordResetResult,
} from '@/components/auth/auth-operations'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { setPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { ForgotPasswordFormValues } from '@/components/auth/types'

const authFetch = createAuthFetch()

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const pending = usePendingOtp()

  React.useEffect(() => {
    if (pending?.purpose === 'password_reset') router.replace('/auth/verify-reset-otp')
  }, [pending, router])

  async function handleSubmit(values: ForgotPasswordFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<RequestPasswordResetResult>(REQUEST_PASSWORD_RESET, {
        input: { email: values.email },
      })
      setPendingOtp(values.email, 'password_reset', data.requestPasswordReset.otp)
      router.push('/auth/verify-reset-otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  if (pending?.purpose === 'password_reset') return null

  return (
    <AuthShell
      title="Forgot Password"
      description="Enter your email address and we'll send you a code to reset your password."
      header={
        <AuthBackLink href="/auth/login" LinkComponent={Link}>
          Back to Login
        </AuthBackLink>
      }
    >
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        showLoginLink={false}
        LinkComponent={Link}
      />
    </AuthShell>
  )
}
