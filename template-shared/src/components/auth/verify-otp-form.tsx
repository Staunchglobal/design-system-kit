'use client'

import * as React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { DEMO_OTP_CODE } from '@/components/auth/auth-operations'
import { useOtpTimer } from '@/components/auth/use-otp-timer'
import type { OtpMode, VerifyOtpFormValues } from '@/components/auth/types'
import { REGEXP_ONLY_DIGITS } from 'input-otp'

export type VerifyOtpFormProps = {
  email: string
  mode: OtpMode
  onSubmit: (values: VerifyOtpFormValues) => void | Promise<void>
  onResend: () => void | Promise<void>
  loading?: boolean
  resendLoading?: boolean
  error?: string | null
  otpHint?: string | null
  startTimerOnMount?: boolean
}

export function VerifyOtpForm({
  email,
  mode,
  onSubmit,
  onResend,
  loading = false,
  resendLoading = false,
  error = null,
  otpHint = null,
  startTimerOnMount = true,
}: VerifyOtpFormProps) {
  const [otp, setOtp] = React.useState('')
  const [fieldError, setFieldError] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)
  const { secondsLeft, canResend, ready, start, startIfNeeded } = useOtpTimer()

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
    if (!canResend || resendLoading) return
    await onResend()
    start()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field data-invalid={submitted && !!fieldError}>
          <FieldLabel>Verification code</FieldLabel>
          <FieldDescription>
            Enter the 6-digit code sent to <span className="text-foreground font-medium">{email}</span>
            {mode === 'reset' ? ' to reset your password.' : '.'}
          </FieldDescription>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(next) => {
              const digits = next.replace(/\D/g, '')
              setOtp(digits)
              if (submitted) setFieldError(otpErrorFor(digits))
            }}
            disabled={loading}
            containerClassName="justify-center"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {submitted ? <FieldError>{fieldError}</FieldError> : null}
          {otpHint || DEMO_OTP_CODE ? (
            <FieldDescription className="text-center">
              Demo code: <code className="text-foreground">{otpHint || DEMO_OTP_CODE}</code>
            </FieldDescription>
          ) : null}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
        {loading ? 'Verifying…' : 'Verify'}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        {!ready ? (
          <>Resend available in …</>
        ) : canResend ? (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            disabled={resendLoading}
            onClick={handleResend}
          >
            {resendLoading ? 'Sending…' : 'Resend code'}
          </Button>
        ) : (
          <>Resend available in {secondsLeft}s</>
        )}
      </p>
    </form>
  )
}
