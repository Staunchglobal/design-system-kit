'use client'

import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 items-center justify-start overflow-visible rounded-full border border-border bg-muted py-0.5 shadow-none transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 hover:border-neutral-400 hover:bg-neutral-200 active:border-neutral-400 active:bg-neutral-300 data-checked:justify-end data-checked:border-primary data-checked:bg-primary data-checked:hover:border-primary-500 data-checked:hover:bg-primary-500 data-checked:active:border-primary-700 data-checked:active:bg-primary-700 focus-visible:ring-3 focus-visible:ring-primary/35 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/35 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:border-border data-disabled:hover:bg-muted data-disabled:hover:data-checked:border-primary data-disabled:hover:data-checked:bg-primary data-[size=default]:h-5 data-[size=default]:w-12 data-[size=default]:px-1 data-[size=sm]:h-4 data-[size=sm]:w-9 data-[size=sm]:px-0.5 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:data-checked:hover:bg-primary-300 dark:data-disabled:hover:bg-neutral-700',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block h-3 w-5 shrink-0 rounded-full bg-neutral-0 shadow-(--shadow-xs) group-data-disabled/switch:bg-neutral-500 group-data-[size=sm]/switch:h-2.5 group-data-[size=sm]/switch:w-3.5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
