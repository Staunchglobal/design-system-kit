'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { createAccountSettingsFetch } from '@/components/account-settings/account-settings-fetch'
import {
  REQUEST_EMAIL_CHANGE,
  VERIFY_CURRENT_EMAIL_CHANGE,
  REQUEST_NEW_EMAIL_CHANGE,
  VERIFY_NEW_EMAIL_CHANGE,
  RESEND_EMAIL_CHANGE_OTP,
  CANCEL_EMAIL_CHANGE,
  type RequestEmailChangeResult,
  type VerifyCurrentEmailChangeResult,
  type RequestNewEmailChangeResult,
  type VerifyNewEmailChangeResult,
  type ResendEmailChangeOtpResult,
  type CancelEmailChangeResult,
} from '@/components/account-settings/account-settings-operations'
import { getAuthSession, setAuthSession } from '@/components/auth/auth-session'
import type { OtpFormValues } from '@/components/auth/types'

export type EmailChangeDialogStep = 'verify-current' | 'enter-new-email' | 'verify-new'

export type UseEmailChangeDialogOptions = {
  endpoint?: string
}

// No localStorage persistence here on purpose — a refresh mid-flow just
// means the modal is gone and the user clicks "Change email" again. The
// backend's own OTP expiry (not this hook) is what bounds an abandoned
// pending change.
export function useEmailChangeDialog({ endpoint }: UseEmailChangeDialogOptions = {}) {
  const fetcher = React.useMemo(() => createAccountSettingsFetch({ endpoint }), [endpoint])
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<EmailChangeDialogStep>('verify-current')
  const [newEmail, setNewEmail] = React.useState('')
  const [starting, setStarting] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [resendLoading, setResendLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // Dev/staging convenience — nil unless the backend opts into
  // `config.expose_otp_in_response`. Shown below the OTP field via
  // VerifyOtpForm's own `otpHint` prop.
  const [otpHint, setOtpHint] = React.useState<string | null>(null)

  function resetState() {
    setStep('verify-current')
    setNewEmail('')
    setError(null)
    setOtpHint(null)
  }

  async function start() {
    setStarting(true)
    try {
      const data = await fetcher<RequestEmailChangeResult>(REQUEST_EMAIL_CHANGE, { input: {} })
      resetState()
      setOtpHint(data.requestEmailChange.otp ?? null)
      setOpen(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start email change')
    } finally {
      setStarting(false)
    }
  }

  async function verifyCurrent(values: OtpFormValues) {
    setLoading(true)
    setError(null)
    try {
      await fetcher<VerifyCurrentEmailChangeResult>(VERIFY_CURRENT_EMAIL_CHANGE, {
        input: { otp: values.otp },
      })
      setStep('enter-new-email')
      setOtpHint(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  async function submitNewEmail(email: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await fetcher<RequestNewEmailChangeResult>(REQUEST_NEW_EMAIL_CHANGE, {
        input: { newEmail: email },
      })
      setNewEmail(email)
      setOtpHint(data.requestNewEmailChange.otp ?? null)
      setStep('verify-new')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code to that email')
    } finally {
      setLoading(false)
    }
  }

  async function verifyNew(values: OtpFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await fetcher<VerifyNewEmailChangeResult>(VERIFY_NEW_EMAIL_CHANGE, {
        input: { otp: values.otp },
      })
      const session = getAuthSession()
      // Refreshes what every useAuthSession() subscriber (including the
      // parent screen's disabled email field) displays — no reload needed.
      if (session) setAuthSession({ ...session, user: data.verifyNewEmailChange.user })
      setOpen(false)
      resetState()
      toast.success('Email updated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  async function resend() {
    setResendLoading(true)
    setError(null)
    try {
      const data = await fetcher<ResendEmailChangeOtpResult>(RESEND_EMAIL_CHANGE_OTP, { input: {} })
      setOtpHint(data.resendEmailChangeOtp.otp ?? null)
      toast.success(data.resendEmailChangeOtp.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed')
    } finally {
      setResendLoading(false)
    }
  }

  async function cancel() {
    setLoading(true)
    try {
      await fetcher<CancelEmailChangeResult>(CANCEL_EMAIL_CHANGE, { input: {} })
    } catch {
      // Best-effort cleanup — surfacing an error here would trap the user
      // in a modal they're actively trying to leave.
    } finally {
      setLoading(false)
      setOpen(false)
      resetState()
    }
  }

  return {
    open,
    step,
    newEmail,
    starting,
    loading,
    resendLoading,
    error,
    otpHint,
    start,
    verifyCurrent,
    submitNewEmail,
    verifyNew,
    resend,
    cancel,
  }
}
