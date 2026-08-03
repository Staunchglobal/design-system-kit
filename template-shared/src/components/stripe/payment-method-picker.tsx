'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PaymentMethodList } from '@/components/payment-methods/payment-method-list'
import { SegmentedControl } from '@/components/ui/segmented-control'
import type { SavedPaymentMethod } from '@/components/payment-methods/payment-method-card'
import { PaymentMethodForm } from '@/components/stripe/payment-method-form'
import type { PaymentMethod } from '@stripe/stripe-js'

type PaymentMethodPickerProps = {
  /**
   * Payment methods already on file (fetched from your backend / Stripe Customer).
   * The component owns selection state but never mutates this list — add the new
   * PaymentMethod to your backend, then refresh the list yourself.
   */
  methods: SavedPaymentMethod[]
  selectedId?: string
  onSelectExisting: (id: string) => void
  onAddNew: (paymentMethod: PaymentMethod) => void
  triggerLabel?: string
  loading?: boolean
  className?: string
}

type Tab = 'saved' | 'new'

/**
 * Composes PaymentMethodList + PaymentMethodForm inside a Dialog.
 * Lets users pick a saved card or add a new one via Stripe's PaymentElement.
 *
 * The "Add new card" tab renders PaymentMethodForm, which must live inside an
 * <Elements> provider — wrap the entire feature in <StripeElementsProvider>.
 *
 * Backend boundary: this component never calls Stripe or your API directly.
 * It hands raw PaymentMethod objects to onAddNew; the caller is responsible
 * for attaching them to a Stripe Customer via their backend.
 */
function PaymentMethodPicker({
  methods,
  selectedId,
  onSelectExisting,
  onAddNew,
  triggerLabel = 'Change payment method',
  loading = false,
  className,
}: PaymentMethodPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<Tab>('saved')

  const hasSaved = methods.length > 0

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) setTab(hasSaved ? 'saved' : 'new')
  }

  function handleNewMethod(paymentMethod: PaymentMethod) {
    onAddNew(paymentMethod)
    setOpen(false)
  }

  const tabOptions = [
    { value: 'saved' as Tab, label: 'Saved cards', count: methods.length || undefined },
    { value: 'new' as Tab, label: 'Add new card' },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment method</DialogTitle>
        </DialogHeader>

        {hasSaved ? (
          <SegmentedControl
            options={tabOptions}
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            ariaLabel="Payment method options"
          />
        ) : null}

        {tab === 'saved' && hasSaved ? (
          <PaymentMethodList
            methods={methods}
            selectedId={selectedId}
            onSelect={(id) => {
              onSelectExisting(id)
              setOpen(false)
            }}
            loading={loading}
          />
        ) : (
          <PaymentMethodForm onSuccess={handleNewMethod} onCancel={() => setOpen(false)} />
        )}

        {tab === 'saved' && hasSaved ? (
          <DialogFooter showCloseButton>
            <Button
              variant="ghost"
              size="sm"
              className="mr-auto"
              onClick={() => setTab('new')}
            >
              + Add new card
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { PaymentMethodPicker }
export type { PaymentMethodPickerProps }
