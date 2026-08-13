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
        'peer relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-neutral-950/40 bg-neutral-0 text-primary-foreground transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 group-has-disabled/field:opacity-50 data-checked:border-primary data-checked:bg-primary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/35 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/35 aria-invalid:aria-checked:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-0/40 dark:bg-neutral-900',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3"
      >
        <AppIcon name="checkbox.check" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
