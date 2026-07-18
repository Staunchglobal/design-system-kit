/**
 * Stripe payment method feature — filesystem discovery picks up slug `stripe-payment-method`.
 * Prefer importing from `@/components/stripe/*` directly for tree-shaking.
 *
 * Requires <StripeElementsProvider publishableKey={…} options={…}> to wrap the usage site.
 * Peer deps: @stripe/react-stripe-js ^6, @stripe/stripe-js ^9
 */
export { StripeElementsProvider } from '@/components/stripe/stripe-elements-provider'
export type { StripeElementsProviderProps } from '@/components/stripe/stripe-elements-provider'

export { PaymentMethodForm } from '@/components/stripe/payment-method-form'
export type { PaymentMethodFormProps } from '@/components/stripe/payment-method-form'

export { PaymentMethodPicker } from '@/components/stripe/payment-method-picker'
export type { PaymentMethodPickerProps } from '@/components/stripe/payment-method-picker'
