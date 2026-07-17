'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  LOGIN_WITH_OTP,
  RESEND_OTP,
  SEND_PASSWORD_RESET_OTP,
  VERIFY_PASSWORD_RESET_OTP,
  type LoginWithOtpResult,
  type ResendOtpResult,
  type SendPasswordResetOtpResult,
  type VerifyPasswordResetOtpResult,
} from '@/components/auth/auth-operations'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import { toast } from '@/components/auth/notify'
import {
  clearAuthHandoff,
  setAuthHandoff,
  setAuthSession,
} from '@/components/auth/auth-session'
import { useAuthHandoff } from '@/components/auth/use-auth-store'
import { clearOtpCooldown } from '@/components/auth/otp-timer-storage'
import type { VerifyOtpFormValues } from '@/components/auth/types'

const authFetch = createAuthFetch()

export default function VerifyOtpPage() {
  const router = useRouter()
  const handoff = useAuthHandoff()
  const email = handoff.email ?? ''
  const mode = handoff.mode ?? 'login'
  const otpHint = handoff.otpHint
  const [loading, setLoading] = React.useState(false)
  const [resendLoading, setResendLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!handoff.email) {
      router.replace(handoff.mode === 'reset' ? '/auth/forgot-password' : '/auth/login')
    }
  }, [handoff.email, handoff.mode, router])

  React.useEffect(() => {
    // Leaving the OTP page (back, navigate away) clears the cooldown from localStorage.
    return () => {
      clearOtpCooldown()
    }
  }, [])

  async function handleSubmit(values: VerifyOtpFormValues) {
    setLoading(true)
    setError(null)
    try {
      if (mode === 'reset') {
        const data = await authFetch<VerifyPasswordResetOtpResult>(VERIFY_PASSWORD_RESET_OTP, {
          email,
          otp: values.otp,
        })
        clearAuthHandoff()
        toast.success('Code verified')
        router.push(
          `/auth/reset-password?token=${encodeURIComponent(data.verifyPasswordResetOtp.resetPasswordToken)}`
        )
        return
      }
      const data = await authFetch<LoginWithOtpResult>(LOGIN_WITH_OTP, {
        email,
        otp: values.otp,
      })
      clearAuthHandoff()
      setAuthSession({
        token: data.loginWithOtp.token,
        user: data.loginWithOtp.user,
      })
      toast.success('Signed in')
      router.push('/auth/home')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResendLoading(true)
    try {
      if (mode === 'reset') {
        const data = await authFetch<SendPasswordResetOtpResult>(SEND_PASSWORD_RESET_OTP, {
          email,
        })
        setAuthHandoff(email, 'reset', data.sendPasswordResetOtp.otpCode ?? undefined)
        toast.success(data.sendPasswordResetOtp.message)
      } else {
        const data = await authFetch<ResendOtpResult>(RESEND_OTP, { email })
        setAuthHandoff(email, 'login', data.resendOtp.otpCode ?? undefined)
        toast.success(data.resendOtp.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Resend failed'
      toast.error(message)
    } finally {
      setResendLoading(false)
    }
  }

  if (!handoff.email) {
    return (
      <AuthShell title="Verify code">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Verify code" description="Enter the 6-digit one-time password.">
      <VerifyOtpForm
        email={email}
        mode={mode}
        onSubmit={handleSubmit}
        onResend={handleResend}
        loading={loading}
        resendLoading={resendLoading}
        error={error}
        otpHint={otpHint}
      />
    </AuthShell>
  )
}
