'use client'

import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'peer relative aspect-square size-5 shrink-0 cursor-pointer rounded-full border border-neutral-200 bg-background outline-none transition-[background-color,border-color,box-shadow] after:absolute after:-inset-x-3 after:-inset-y-2',
        'hover:border-neutral-400 hover:ring-4 hover:ring-primary-50',
        'active:border-neutral-400 active:bg-neutral-0 active:ring-4 active:ring-primary-100',
        'aria-checked:border-4 aria-checked:border-primary aria-checked:bg-neutral-0',
        'aria-checked:hover:border-primary-500 aria-checked:hover:ring-primary-50',
        'aria-checked:active:border-primary-700 aria-checked:active:ring-primary-100',
        'focus-visible:ring-4 focus-visible:ring-primary-100',
        'aria-invalid:border-destructive-700 aria-invalid:hover:border-destructive-700 aria-invalid:hover:ring-0 aria-invalid:aria-checked:border-primary',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-neutral-200 disabled:hover:ring-0 disabled:aria-checked:border-4 disabled:aria-checked:border-primary disabled:aria-checked:bg-neutral-0',
        className
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
