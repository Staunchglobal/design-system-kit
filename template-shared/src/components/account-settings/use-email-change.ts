'use client'

import * as React from 'react'

import { createAccountSettingsFetch } from '@/components/account-settings/account-settings-fetch'
import {
  CANCEL_EMAIL_CHANGE,
  REQUEST_EMAIL_CHANGE,
  VERIFY_CURRENT_EMAIL_CHANGE,
  VERIFY_NEW_EMAIL_CHANGE,
  type CancelEmailChangeResult,
  type RequestEmailChangeResult,
  type VerifyCurrentEmailChangeResult,
  type VerifyNewEmailChangeResult,
} from '@/components/account-settings/account-settings-operations'
import { setAuthSession, getAuthSession } from '@/components/auth/auth-session'
import type { OtpFormValues } from '@/components/auth/types'
import {
  readPendingEmailChange,
  writePendingEmailChange,
  clearPendingEmailChange,
} from '@/components/account-settings/email-change-storage'

export type EmailChangeStep = 'request' | 'verify-current' | 'verify-new' | 'done'

export type RequestEmailChangeValues = {
  currentPassword: string
  newEmail: string
}

export type UseEmailChangeOptions = {
  endpoint?: string
}

export function useEmailChange({ endpoint }: UseEmailChangeOptions = {}): {
  step: EmailChangeStep
  loading: boolean
  error: string | null
  newEmail: string
  request: (values: RequestEmailChangeValues) => Promise<void>
  verifyCurrent: (values: OtpFormValues) => Promise<void>
  verifyNew: (values: OtpFormValues) => Promise<void>
  cancel: () => Promise<void>
  reset: () => void
} {
  const fetcher = React.useMemo(() => createAccountSettingsFetch({ endpoint }), [endpoint])
  // Lazy-initialized from localStorage so a refresh mid-verification lands
  // back on the same OTP step instead of silently bouncing to 'request' —
  // see email-change-storage.ts for why only verify-current/verify-new
  // are persisted.
  const [step, setStepState] = React.useState<EmailChangeStep>(
    () => readPendingEmailChange()?.step ?? 'request'
  )
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [newEmail, setNewEmailState] = React.useState(() => readPendingEmailChange()?.newEmail ?? '')

  // Single setter updating both pieces of persisted state together and
  // always with an explicit email — a default parameter reading the
  // `newEmail` state variable here would capture a stale closure value
  // when a caller advances the step in the same tick it also changes the
  // email (see `request` below), silently persisting the wrong email.
  function advance(next: EmailChangeStep, email: string) {
    setStepState(next)
    setNewEmailState(email)
    writePendingEmailChange(next, email)
  }

  async function request(values: RequestEmailChangeValues) {
    setLoading(true)
    setError(null)
    try {
      await fetcher<RequestEmailChangeResult>(REQUEST_EMAIL_CHANGE, { input: values })
      advance('verify-current', values.newEmail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request email change')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCurrent(values: OtpFormValues) {
    setLoading(true)
    setError(null)
    try {
      await fetcher<VerifyCurrentEmailChangeResult>(VERIFY_CURRENT_EMAIL_CHANGE, {
        input: { otp: values.otp },
      })
      advance('verify-new', newEmail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
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
      if (session) setAuthSession({ ...session, user: data.verifyNewEmailChange.user })
      // 'done' isn't a resumable step (see email-change-storage.ts) — clear
      // rather than persist it.
      setStepState('done')
      clearPendingEmailChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  async function cancel() {
    setLoading(true)
    setError(null)
    try {
      await fetcher<CancelEmailChangeResult>(CANCEL_EMAIL_CHANGE, { input: {} })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel')
    } finally {
      setLoading(false)
      setStepState('request')
      setNewEmailState('')
      clearPendingEmailChange()
    }
  }

  return {
    step,
    loading,
    error,
    newEmail,
    request,
    verifyCurrent,
    verifyNew,
    cancel,
    reset: () => {
      setStepState('request')
      clearPendingEmailChange()
    },
  }
}
