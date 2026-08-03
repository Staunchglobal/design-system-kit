'use client'

import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  RESEND_OTP,
  VERIFY_OTP,
  type ResendOtpResult,
  type VerifyOtpResult,
} from '@/components/auth/auth-operations'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import { toast } from '@/components/auth/notify'
import { setAuthSession, setPendingOtp, clearPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { OtpFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

function go(path: string) {
  window.location.assign(path)
}

export default function VerifyOtpPage() {
  const [loading, setLoading] = React.useState(false)
  const [resendLoading, setResendLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // Backed by localStorage — surviving a page refresh here is the whole
  // point of this being its own route: reloading mid-verification must
  // not bounce back to the credentials form.
  const pending = usePendingOtp()
  // Set right before navigating away on success/cancel — `clearPendingOtp()`
  // flips `pending` to null a render before the browser navigation actually
  // lands, and without this the redirect-away effect below races it back
  // to /auth/login instead of wherever we're actually headed.
  const navigatingAway = React.useRef(false)

  React.useEffect(() => {
    if (!pending && !navigatingAway.current) go('/auth/login')
  }, [pending])

  if (!pending) return null

  async function handleOtp(values: OtpFormValues) {
    if (!pending) return
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<VerifyOtpResult>(VERIFY_OTP, {
        input: { email: pending.email, otp: values.otp },
      })
      setAuthSession({ token: data.verifyOtp.token, user: data.verifyOtp.user })
      navigatingAway.current = true
      clearPendingOtp()
      toast.success(pending.purpose === 'signup' ? 'Account created' : 'Signed in')
      go('/auth/home')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!pending) return
    setResendLoading(true)
    try {
      const data = await authFetch<ResendOtpResult>(RESEND_OTP, { input: { email: pending.email } })
      setPendingOtp(pending.email, pending.purpose, data.resendOtp.otp)
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
            go(pending.purpose === 'signup' ? '/auth/signup' : '/auth/login')
          }}
        >
          {pending.purpose === 'signup' ? 'Back to sign up' : 'Back to sign in'}
        </button>
      </AuthShell>
      <Toaster />
    </>
  )
}
