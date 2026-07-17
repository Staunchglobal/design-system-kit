'use client'

import * as React from 'react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { PaymentMethodList, type SavedPaymentMethod } from '@/components/ui/payment-method-list'

const METHODS: SavedPaymentMethod[] = [
  { id: '1', brand: 'visa', last4: '4242', expiryMonth: 12, expiryYear: 2028, isDefault: true },
  { id: '2', brand: 'mastercard', last4: '4444', expiryMonth: 6, expiryYear: 2027 },
  { id: '3', brand: 'amex', last4: '0005', expiryMonth: 3, expiryYear: 2029 },
]

export default function PaymentMethodListDemo() {
  const [selectedId, setSelectedId] = React.useState('1')
  const [methods, setMethods] = React.useState(METHODS)
  return (
    <ComponentSection
      id="payment-method-list"
      title="Payment Method List"
      description="Selectable saved-card list with brand icons (no payment SDK)."
    >
      <ExampleGrid>
        <Example title="Selectable" contentClassName="block w-full max-w-md">
          <PaymentMethodList
            methods={methods}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onSetDefault={(id) =>
              setMethods((ms) => ms.map((m) => ({ ...m, isDefault: m.id === id })))
            }
          />
        </Example>
        <Example title="Loading" contentClassName="block w-full max-w-md">
          <PaymentMethodList methods={[]} onSelect={() => {}} loading />
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
