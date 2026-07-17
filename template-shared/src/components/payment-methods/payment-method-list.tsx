'use client'

import { cn } from '@/lib/utils'
import { ItemGroup } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PaymentMethodCard,
  type SavedPaymentMethod,
} from '@/components/payment-methods/payment-method-card'

type PaymentMethodListProps = {
  methods: SavedPaymentMethod[]
  selectedId?: string
  onSelect: (id: string) => void
  onSetDefault?: (id: string) => void
  loading?: boolean
  className?: string
}

function PaymentMethodList({
  methods,
  selectedId,
  onSelect,
  onSetDefault,
  loading = false,
  className,
}: PaymentMethodListProps) {
  if (loading) {
    return (
      <div data-slot="payment-method-list" className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <ItemGroup
      data-slot="payment-method-list"
      role="radiogroup"
      aria-label="Saved payment methods"
      className={cn('gap-2', className)}
    >
      {methods.map((method) => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          selected={selectedId === method.id}
          onSelect={() => onSelect(method.id)}
          onSetDefault={onSetDefault ? () => onSetDefault(method.id) : undefined}
        />
      ))}
    </ItemGroup>
  )
}

export { PaymentMethodList }
export type { PaymentMethodListProps }
