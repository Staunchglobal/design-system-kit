'use client'

import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { CardBrandIcon, type CardBrand } from '@/components/payment-methods/card-brand-icon'

type SavedPaymentMethod = {
  id: string
  brand: CardBrand
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault?: boolean
}

type PaymentMethodCardProps = {
  method: SavedPaymentMethod
  selected?: boolean
  onSelect?: () => void
  onSetDefault?: () => void
  busy?: boolean
  className?: string
}

function PaymentMethodCard({
  method,
  selected = false,
  onSelect,
  onSetDefault,
  busy = false,
  className,
}: PaymentMethodCardProps) {
  const expiry = `${String(method.expiryMonth).padStart(2, '0')}/${String(method.expiryYear).slice(-2)}`

  return (
    <Item
      data-slot="payment-method-card"
      variant={selected ? 'muted' : 'outline'}
      className={cn(
        onSelect && 'cursor-pointer',
        selected && 'ring-ring ring-2',
        className
      )}
      role={onSelect ? 'radio' : undefined}
      aria-checked={onSelect ? selected : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
    >
      <ItemMedia>
        <CardBrandIcon brand={method.brand} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          •••• {method.last4}
          {method.isDefault ? (
            <span className="text-muted-foreground text-xs font-normal">Default</span>
          ) : null}
        </ItemTitle>
        <ItemDescription>Expires {expiry}</ItemDescription>
      </ItemContent>
      {onSetDefault && !method.isDefault ? (
        <ItemActions>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={busy}
            aria-label="Set as default"
            onClick={(e) => {
              e.stopPropagation()
              onSetDefault()
            }}
          >
            <Star className="size-3.5" />
          </Button>
        </ItemActions>
      ) : method.isDefault ? (
        <ItemActions>
          <Star className="text-amber-500 size-3.5 fill-current" aria-label="Default card" />
        </ItemActions>
      ) : null}
    </Item>
  )
}

export { PaymentMethodCard }
export type { PaymentMethodCardProps, SavedPaymentMethod }
