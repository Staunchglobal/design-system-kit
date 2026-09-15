'use client'

import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/icons/icon'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-neutral-200 bg-background text-primary-foreground outline-none transition-[background-color,border-color,box-shadow] after:absolute after:-inset-x-3 after:-inset-y-2 group-has-disabled/field:opacity-50',
        'hover:border-neutral-400 hover:ring-4 hover:ring-primary-50',
        'active:border-neutral-400 active:bg-neutral-0 active:ring-4 active:ring-primary-100',
        'aria-checked:border-primary aria-checked:bg-primary aria-checked:hover:border-primary-500 aria-checked:hover:bg-primary-500 aria-checked:hover:ring-primary-50 aria-checked:active:border-primary-700 aria-checked:active:bg-primary-700 aria-checked:active:ring-primary-100',
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:hover:border-primary-500 data-[state=indeterminate]:hover:bg-primary-500 data-[state=indeterminate]:hover:ring-primary-50 data-[state=indeterminate]:active:border-primary-700 data-[state=indeterminate]:active:bg-primary-700 data-[state=indeterminate]:active:ring-primary-100',
        'focus-visible:ring-4 focus-visible:ring-primary-100',
        'aria-invalid:border-destructive-700 aria-invalid:hover:border-destructive-700 aria-invalid:hover:ring-0 aria-invalid:aria-checked:border-primary',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-neutral-200 disabled:hover:ring-0 disabled:aria-checked:border-primary disabled:aria-checked:bg-primary disabled:data-[state=indeterminate]:border-primary disabled:data-[state=indeterminate]:bg-primary',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <AppIcon name="checkbox.check" className="hidden size-3 in-data-[state=checked]:block" />
        <AppIcon
          name="checkbox.indeterminate"
          className="hidden size-3 in-data-[state=indeterminate]:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
