'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'unionpay'
  | 'diners'
  | 'jcb'

const VIEW_BOX = '0 0 40 28'

function VisaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} className={className} fill="none" aria-hidden>
      <rect width="40" height="28" rx="3" fill="#1A1F71" />
      <text x="20" y="19" fill="#FFFFFF" textAnchor="middle" fontSize="11" fontWeight="bold">
        VISA
      </text>
    </svg>
  )
}

function MastercardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} className={className} fill="none" aria-hidden>
      <circle cx="15" cy="14" r="7" fill="#EB001B" />
      <circle cx="25" cy="14" r="7" fill="#F79E1B" />
    </svg>
  )
}

function AmexIcon({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} className={className} fill="none" aria-hidden>
      <rect width="40" height="28" rx="3" fill="#006FCF" />
      <text x="20" y="18" fill="#FFFFFF" textAnchor="middle" fontSize="9" fontWeight="bold">
        AMEX
      </text>
    </svg>
  )
}

function DiscoverIcon({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} className={className} fill="none" aria-hidden>
      <rect width="40" height="28" rx="3" fill="#FF6000" />
      <text x="20" y="18" fill="#FFFFFF" textAnchor="middle" fontSize="8" fontWeight="bold">
        DISC
      </text>
    </svg>
  )
}

function UnionPayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} className={className} fill="none" aria-hidden>
      <rect width="40" height="28" rx="3" fill="#00447C" />
      <text x="20" y="18" fill="#FFFFFF" textAnchor="middle" fontSize="7" fontWeight="bold">
        UnionPay
      </text>
    </svg>
  )
}

function DinersClubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} className={className} fill="none" aria-hidden>
      <rect width="40" height="28" rx="3" fill="#0079C0" />
      <text x="20" y="18" fill="#FFFFFF" textAnchor="middle" fontSize="7" fontWeight="bold">
        DINERS
      </text>
    </svg>
  )
}

function JCBIcon({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} className={className} fill="none" aria-hidden>
      <rect width="40" height="28" rx="3" fill="#0E4C96" />
      <text x="20" y="18" fill="#FFFFFF" textAnchor="middle" fontSize="10" fontWeight="bold">
        JCB
      </text>
    </svg>
  )
}

const ICONS: Record<CardBrand, React.FC<{ className?: string }>> = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: DiscoverIcon,
  unionpay: UnionPayIcon,
  diners: DinersClubIcon,
  jcb: JCBIcon,
}

type CardBrandIconProps = {
  brand: CardBrand
  className?: string
}

function CardBrandIcon({ brand, className }: CardBrandIconProps) {
  const Icon = ICONS[brand]
  if (!Icon) return null
  return <Icon className={cn('h-7 w-10', className)} />
}

export { CardBrandIcon }
export type { CardBrand, CardBrandIconProps }
