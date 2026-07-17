'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  SEND_PASSWORD_RESET_OTP,
  type SendPasswordResetOtpResult,
} from '@/components/auth/auth-operations'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { toast } from '@/components/auth/notify'
import { setAuthHandoff } from '@/components/auth/auth-session'
import type { ForgotPasswordFormValues } from '@/components/auth/types'

const authFetch = createAuthFetch()

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(values: ForgotPasswordFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<SendPasswordResetOtpResult>(SEND_PASSWORD_RESET_OTP, {
        email: values.email,
      })
      setAuthHandoff(values.email, 'reset', data.sendPasswordResetOtp.otpCode ?? undefined)
      toast.success(data.sendPasswordResetOtp.message)
      router.push('/auth/verify-otp')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Forgot password" description="We’ll send a one-time code to reset your password.">
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        LinkComponent={Link}
      />
    </AuthShell>
  )
}
