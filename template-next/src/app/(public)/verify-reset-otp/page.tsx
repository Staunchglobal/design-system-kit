'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthBackLink } from '@/components/auth/auth-back-link'
import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  RESEND_OTP,
  VERIFY_PASSWORD_RESET_OTP,
  type ResendOtpResult,
  type VerifyPasswordResetOtpResult,
} from '@/components/auth/auth-operations'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import { toast } from '@/components/auth/notify'
import { setPendingOtp, clearPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { OtpFormValues } from '@/components/auth/types'

const authFetch = createAuthFetch()

export default function VerifyResetOtpPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [resendLoading, setResendLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const pending = usePendingOtp()
  const isPasswordReset = pending?.purpose === 'password_reset'
  const navigatingAway = React.useRef(false)

  React.useEffect(() => {
    if (!isPasswordReset && !navigatingAway.current) router.replace('/forgot-password')
  }, [isPasswordReset, router])

  if (!isPasswordReset || !pending) return null

  const email = pending.email

  async function handleOtp(values: OtpFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<VerifyPasswordResetOtpResult>(VERIFY_PASSWORD_RESET_OTP, {
        input: { email, otp: values.otp },
      })
      navigatingAway.current = true
      clearPendingOtp()
      router.push(
        `/reset-password?token=${encodeURIComponent(data.verifyPasswordResetOtp.resetPasswordToken)}`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResendLoading(true)
    setError(null)
    try {
      const data = await authFetch<ResendOtpResult>(RESEND_OTP, { input: { email } })
      setPendingOtp(email, 'password_reset', data.resendOtp.otp)
      toast.success(data.resendOtp.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthShell
      title="Verify Email"
      description={`Enter the 6-digit code we emailed to ${pending.email}.`}
      header={
        <AuthBackLink
          onClick={() => {
            navigatingAway.current = true
            clearPendingOtp()
            setError(null)
            router.push('/forgot-password')
          }}
        >
          Back to Forgot Password
        </AuthBackLink>
      }
    >
      <VerifyOtpForm
        onSubmit={handleOtp}
        onResend={handleResend}
        loading={loading}
        resendLoading={resendLoading}
        error={error}
        otpHint={pending.otp}
        startTimerOnMount
      />
    </AuthShell>
  )
}
