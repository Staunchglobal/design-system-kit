'use client'

import * as React from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { PaymentMethod } from '@stripe/stripe-js'

import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type PaymentMethodFormProps = {
  onSuccess: (paymentMethod: PaymentMethod) => void
  onCancel?: () => void
  submitLabel?: string
  className?: string
}

function PaymentMethodForm({
  onSuccess,
  onCancel,
  submitLabel = 'Save card',
  className,
}: PaymentMethodFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [busy, setBusy] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setBusy(true)
    setErrorMessage(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message ?? 'Validation failed. Please check your card details.')
      setBusy(false)
      return
    }

    const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({ elements })
    if (pmError) {
      setErrorMessage(pmError.message ?? 'Could not save payment method. Please try again.')
      setBusy(false)
      return
    }

    setBusy(false)
    if (paymentMethod) {
      onSuccess(paymentMethod)
    }
  }

  const ready = Boolean(stripe && elements)

  return (
    <form
      data-slot="stripe-payment-form"
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-4', className)}
    >
      <PaymentElement />

      {errorMessage ? (
        <Alert variant="destructive" data-ui="stripe-payment-error">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={!ready || busy}>
          {busy ? <Spinner className="mr-1.5" /> : null}
          {busy ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export { PaymentMethodForm }
export type { PaymentMethodFormProps }
