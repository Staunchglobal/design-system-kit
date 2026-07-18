'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import {
  StripeElementsProvider,
  PaymentMethodForm,
  PaymentMethodPicker,
} from '@/components/ui/stripe-payment-method'
import type { SavedPaymentMethod } from '@/components/ui/payment-method-list'

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

const SAVED: SavedPaymentMethod[] = [
  {
    id: 'pm_1',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2028,
    isDefault: true,
  },
  {
    id: 'pm_2',
    brand: 'mastercard',
    last4: '4444',
    expiryMonth: 3,
    expiryYear: 2027,
  },
]

export default function StripePaymentMethodDemo() {
  const [selectedId, setSelectedId] = React.useState('pm_1')
  const [methods, setMethods] = React.useState(SAVED)

  return (
    <ComponentSection
      id="stripe-payment-method"
      title="Stripe Payment Method"
      description="Stripe Elements provider, PaymentMethod form tokenization, and saved/new picker. Bring your own backend to attach the PaymentMethod."
    >
      <Example title="Elements provider + form" contentClassName="block w-full max-w-md">
        <StripeElementsProvider
          publishableKey={STRIPE_KEY}
          options={{ mode: 'setup', currency: 'usd' }}
        >
          {STRIPE_KEY ? (
            <PaymentMethodForm
              onSuccess={(pm) => {
                console.info('Created PaymentMethod', pm.id)
              }}
            />
          ) : null}
        </StripeElementsProvider>
        {!STRIPE_KEY ? (
          <p className="text-muted-foreground mt-3 text-sm">
            Set <code className="font-mono text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to
            render live Stripe Elements.
          </p>
        ) : null}
      </Example>
      <Example title="Payment method picker" contentClassName="block w-full max-w-md">
        <StripeElementsProvider
          publishableKey={STRIPE_KEY}
          options={{ mode: 'setup', currency: 'usd' }}
        >
          <PaymentMethodPicker
            methods={methods}
            selectedId={selectedId}
            onSelectExisting={setSelectedId}
            onAddNew={(pm) => {
              const card = pm.card
              if (!card) return
              const next: SavedPaymentMethod = {
                id: pm.id,
                brand: (card.brand as SavedPaymentMethod['brand']) ?? 'visa',
                last4: card.last4 ?? '0000',
                expiryMonth: card.exp_month ?? 1,
                expiryYear: card.exp_year ?? 2030,
              }
              setMethods((prev) => [next, ...prev])
              setSelectedId(pm.id)
            }}
          />
        </StripeElementsProvider>
      </Example>
    </ComponentSection>
  )
}
