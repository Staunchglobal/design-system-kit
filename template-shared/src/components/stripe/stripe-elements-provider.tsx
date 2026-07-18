'use client'

import * as React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'

/**
 * Module-level cache so we never call loadStripe() more than once per key.
 * loadStripe is a side-effecting async call that fetches stripe.js from CDN;
 * creating multiple instances causes Stripe to warn in the console.
 */
const stripePromiseCache = new Map<string, ReturnType<typeof loadStripe>>()

function getOrLoadStripe(publishableKey: string): ReturnType<typeof loadStripe> {
  if (!stripePromiseCache.has(publishableKey)) {
    stripePromiseCache.set(publishableKey, loadStripe(publishableKey))
  }
  return stripePromiseCache.get(publishableKey)!
}

type StripeElementsProviderProps = {
  /**
   * Stripe publishable key (pk_live_… or pk_test_…).
   * Omit or pass an empty string to render a "not configured" placeholder
   * instead of throwing — useful during local development.
   */
  publishableKey: string
  /**
   * Passed verbatim to <Elements options={…}>.
   * At minimum you usually need { mode: 'setup', currency: 'usd' } when using
   * PaymentElement without a client_secret (deferred-intent flow).
   */
  options?: StripeElementsOptions
  children: React.ReactNode
}

/**
 * Wraps children in Stripe's <Elements> provider with sensible caching.
 * Mount this once per page — do NOT nest it inside a component that re-renders
 * frequently, as the cached Promise is stable but the Elements context is not.
 */
function StripeElementsProvider({
  publishableKey,
  options,
  children,
}: StripeElementsProviderProps) {
  if (!publishableKey) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
        Stripe publishable key not configured. Set{' '}
        <code className="font-mono text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to enable
        payment features.
      </div>
    )
  }

  const stripePromise = getOrLoadStripe(publishableKey)

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}

export { StripeElementsProvider }
export type { StripeElementsProviderProps }
