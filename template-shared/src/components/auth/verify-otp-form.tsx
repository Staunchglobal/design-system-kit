'use client'

import * as React from 'react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { OtpField } from '@/components/auth/otp-field'
import type { OtpFormValues } from '@/components/auth/types'
import { useOtpTimer } from '@/components/auth/use-otp-timer'
import { FieldError } from '@/components/ui/field'

export type VerifyOtpFormProps = {
  onSubmit: (values: OtpFormValues) => void | Promise<void>
  onResend?: () => void | Promise<void>
  loading?: boolean
  resendLoading?: boolean
  error?: string | null
  submitLabel?: string
  /** The code itself, when the backend returned one (dev/staging convenience). */
  otpHint?: string | null
  /** False when the caller already started the cooldown and this mount shouldn't restart it. */
  startTimerOnMount?: boolean
}

function formatTimer(seconds: number) {
  const m = String(Math.floor(seconds / 60))
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export function VerifyOtpForm({
  onSubmit,
  onResend,
  loading = false,
  resendLoading = false,
  error = null,
  submitLabel = 'Verify code',
  otpHint = null,
  startTimerOnMount = false,
}: VerifyOtpFormProps) {
  const [otp, setOtp] = React.useState('')
  const [fieldError, setFieldError] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)
  const { secondsLeft, canResend, start, startIfNeeded } = useOtpTimer()

  React.useEffect(() => {
    if (startTimerOnMount) startIfNeeded()
  }, [startTimerOnMount, startIfNeeded])

  function otpErrorFor(value: string) {
    if (value.length === 6) return null
    if (value.length === 0) return 'Enter the 6-digit code'
    return `Enter all 6 digits (${value.length}/6)`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const err = otpErrorFor(otp)
    setFieldError(err)
    if (err) return
    await onSubmit({ otp })
  }

  async function handleResend() {
    if (!onResend || !canResend || resendLoading) return
    await onResend()
    start()
  }

  const invalid = submitted && !!fieldError

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <AuthFormError message={error} />

      <div className="flex flex-col gap-2">
        <OtpField
          value={otp}
          onChange={(next) => {
            setOtp(next)
            if (submitted) setFieldError(otpErrorFor(next))
          }}
          disabled={loading}
          autoFocus
          invalid={invalid}
        />

        {submitted && fieldError ? <FieldError>{fieldError}</FieldError> : null}

        {otpHint ? (
          <p className="text-muted-foreground text-center text-xs">
            Code: <code className="text-foreground font-medium">{otpHint}</code>
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <AuthSubmitButton loading={loading} disabled={resendLoading} loadingLabel="Verifying…">
          {submitLabel}
        </AuthSubmitButton>

        {onResend ? (
          // Plain <button>, not the Button component: the theme's
          // `[data-slot='button']` rules outrank utility classes, so a
          // link-styled Button keeps 1rem inline padding and breaks this row.
          <p className="text-muted-foreground text-center text-sm">
            Didn&apos;t receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline disabled:opacity-50"
                disabled={resendLoading}
                onClick={() => void handleResend()}
              >
                {resendLoading ? 'Sending…' : 'Resend'}
              </button>
            ) : (
              <span className="text-primary/50 font-medium">Resend ({formatTimer(secondsLeft)})</span>
            )}
          </p>
        ) : null}
      </div>
    </form>
  )
}
