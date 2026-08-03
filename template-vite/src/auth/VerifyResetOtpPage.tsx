'use client'

import * as React from 'react'

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
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

function go(path: string) {
  window.location.assign(path)
}

export default function VerifyResetOtpPage() {
  const [loading, setLoading] = React.useState(false)
  const [resendLoading, setResendLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // Backed by localStorage — surviving a page refresh here is the whole
  // point of this being its own route: reloading mid-verification must
  // not bounce back to the forgot-password form.
  const pending = usePendingOtp()
  const isPasswordReset = pending?.purpose === 'password_reset'
  // Set right before navigating away on success/cancel — `clearPendingOtp()`
  // flips `isPasswordReset` to false a render before the browser navigation
  // actually lands, and without this the redirect-away effect below races
  // it back to /auth/forgot-password instead of the reset-password page.
  const navigatingAway = React.useRef(false)

  React.useEffect(() => {
    if (!isPasswordReset && !navigatingAway.current) go('/auth/forgot-password')
  }, [isPasswordReset])

  if (!isPasswordReset || !pending) return null

  // Captured as a plain string so TS's null-narrowing of `pending` (which
  // doesn't extend into these nested function declarations) doesn't force
  // redundant null checks on every access below.
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
      go(`/auth/reset-password?token=${encodeURIComponent(data.verifyPasswordResetOtp.resetPasswordToken)}`)
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
      const data = await authFetch<ResendOtpResult>(RESEND_OTP, { input: { email } })
      setPendingOtp(email, 'password_reset', data.resendOtp.otp)
      toast.success(data.resendOtp.message)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resend failed')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <>
      <AuthShell
        title="Verify your email"
        description={`Enter the 6-digit code we emailed to ${pending.email}.`}
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
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground mt-4 text-center text-sm underline-offset-4 hover:underline"
          onClick={() => {
            navigatingAway.current = true
            clearPendingOtp()
            setError(null)
            go('/auth/forgot-password')
          }}
        >
          Back to forgot password
        </button>
      </AuthShell>
      <Toaster />
    </>
  )
}
