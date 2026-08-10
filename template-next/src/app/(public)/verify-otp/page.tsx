'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthBackLink } from '@/components/auth/auth-back-link'
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

const authFetch = createAuthFetch()

export default function VerifyOtpPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [resendLoading, setResendLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const pending = usePendingOtp()
  const navigatingAway = React.useRef(false)

  React.useEffect(() => {
    if (!pending && !navigatingAway.current) router.replace('/login')
  }, [pending, router])

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
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!pending) return
    setResendLoading(true)
    setError(null)
    try {
      const data = await authFetch<ResendOtpResult>(RESEND_OTP, { input: { email: pending.email } })
      setPendingOtp(pending.email, pending.purpose, data.resendOtp.otp)
      toast.success(data.resendOtp.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed')
    } finally {
      setResendLoading(false)
    }
  }

  const backHref = pending.purpose === 'signup' ? '/signup' : '/login'
  const backLabel = pending.purpose === 'signup' ? 'Back to Signup' : 'Back to Login'

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
            router.push(backHref)
          }}
        >
          {backLabel}
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
