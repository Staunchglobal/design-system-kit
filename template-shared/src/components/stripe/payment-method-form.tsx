'use client'

import * as React from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { PaymentMethod } from '@stripe/stripe-js'

import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type PaymentMethodFormProps = {
  /**
   * Called with the newly created PaymentMethod on success.
   * Send pm.id to your backend to attach it to a Customer or confirm a SetupIntent.
   */
  onSuccess: (paymentMethod: PaymentMethod) => void
  /** Optional cancel handler — renders a Cancel button when provided. */
  onCancel?: () => void
  /** Label for the submit button. Defaults to "Save card". */
  submitLabel?: string
  className?: string
}

/**
 * Collects payment details via Stripe's PaymentElement and creates a PaymentMethod.
 *
 * Flow (Stripe.js v9 deferred-intent):
 *   1. elements.submit()          — validates fields, collects details
 *   2. stripe.createPaymentMethod({ elements }) — creates a raw PaymentMethod object
 *   3. onSuccess(paymentMethod)   — caller sends pm.id to their backend
 *
 * Must be rendered inside <StripeElementsProvider> (i.e. inside <Elements>).
 * The parent Elements must be configured with { mode: 'setup' } or a client_secret;
 * without either, elements.submit() will error.
 */
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
      // Stripe.js hasn't loaded yet — this button should be disabled anyway.
      return
    }

    setBusy(true)
    setErrorMessage(null)

    // Step 1: validate fields and collect payment details into the Elements instance.
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message ?? 'Validation failed. Please check your card details.')
      setBusy(false)
      return
    }

    // Step 2: create a PaymentMethod from the submitted Elements data.
    // createPaymentMethod({elements}) requires elements.submit() to have been called first.
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
