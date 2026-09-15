'use client'

import * as React from 'react'
import { Label as LabelPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/icons/icon'

type LabelDirection = 'vertical' | 'horizontal'

function Label({
  className,
  bold = true,
  description,
  direction = 'vertical',
  error = false,
  hint = false,
  hintIcon,
  optional = false,
  required,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  /** Text weight for the label's own text. Defaults to `true` (medium weight) to preserve this
   *  kit's existing look — saferHealth-web defaults to `false` (regular weight). */
  bold?: boolean
  description?: React.ReactNode
  direction?: LabelDirection
  error?: boolean
  hint?: boolean
  hintIcon?: React.ReactNode
  optional?: boolean
  required?: boolean
}) {
  const resolvedHint = hintIcon ?? (hint ? <AppIcon name="label.hint" className="size-full" /> : null)
  const hasMeta = Boolean(required || (optional && !required) || resolvedHint)
  const textClass = cn(
    'text-sm/5',
    bold ? 'font-medium' : 'font-normal',
    error ? 'text-destructive-700' : 'text-foreground'
  )

  // Kept as a direct child of the root (not wrapped) whenever there's no extra meta to lay out
  // alongside it, so `has-[>[data-slot=field]]:...`-style selectors on FieldLabel keep matching
  // when a non-text node (e.g. a <Field>) is passed as children — see field.tsx's "Card-style
  // field with checkbox" example.
  const content = hasMeta ? (
    <span className={cn('flex items-center gap-1', textClass)}>
      {children}
      {required ? <span className="font-bold text-destructive-600">*</span> : null}
      {optional && !required ? (
        <span className="text-xs font-normal text-neutral-500">(optional)</span>
      ) : null}
      {resolvedHint ? (
        <span className="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground">
          {resolvedHint}
        </span>
      ) : null}
    </span>
  ) : (
    children
  )

  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-invalid={error || undefined}
      className={cn(
        'group/label flex cursor-pointer select-none gap-2 group-data-[disabled=true]:cursor-not-allowed group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 has-[+:is([data-slot=checkbox],[data-slot=radio-group-item]):disabled]:cursor-not-allowed has-[+:is([data-slot=checkbox],[data-slot=radio-group-item]):disabled]:opacity-50',
        description
          ? 'flex-col gap-0.5'
          : direction === 'horizontal'
            ? 'flex-row items-center justify-between'
            : cn('items-center', !hasMeta && textClass),
        className
      )}
      {...props}
    >
      {content}
      {description ? (
        <span className="text-sm/5 font-normal text-muted-foreground">{description}</span>
      ) : null}
    </LabelPrimitive.Root>
  )
}

export { Label }
export type { LabelDirection }
