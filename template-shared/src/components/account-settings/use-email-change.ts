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

export type EmailChangeStep = 'request' | 'verify-current' | 'verify-new' | 'done'

export type RequestEmailChangeValues = {
  currentPassword: string
  newEmail: string
}

export type UseEmailChangeOptions = {
  endpoint?: string
}

export function useEmailChange({ endpoint }: UseEmailChangeOptions = {}) {
  const fetcher = React.useMemo(() => createAccountSettingsFetch({ endpoint }), [endpoint])
  const [step, setStep] = React.useState<EmailChangeStep>('request')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [newEmail, setNewEmail] = React.useState('')

  async function request(values: RequestEmailChangeValues) {
    setLoading(true)
    setError(null)
    try {
      await fetcher<RequestEmailChangeResult>(REQUEST_EMAIL_CHANGE, { input: values })
      setNewEmail(values.newEmail)
      setStep('verify-current')
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
      setStep('verify-new')
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
      setStep('done')
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
      setStep('request')
      setNewEmail('')
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
    reset: () => setStep('request'),
  }
}
