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
        'peer group/switch relative inline-flex shrink-0 items-center justify-start overflow-visible rounded-lg border-0 py-0.5 shadow-none transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 bg-neutral-200 hover:bg-neutral-300 data-checked:justify-end data-checked:bg-primary data-checked:hover:bg-primary-600 focus-visible:ring-3 focus-visible:ring-primary/35 aria-invalid:border aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/35 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-neutral-200 data-disabled:hover:data-checked:bg-primary data-[size=default]:h-6 data-[size=default]:w-9 data-[size=default]:px-1 data-[size=sm]:h-5 data-[size=sm]:w-9 data-[size=sm]:px-0.5 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:data-checked:hover:bg-primary-300 dark:data-disabled:hover:bg-neutral-700',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 shrink-0 rounded-full bg-neutral-0 shadow-(--shadow-xs)"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
