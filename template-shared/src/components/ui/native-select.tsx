import * as React from 'react'

import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/icons/icon'

type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default'
}

function NativeSelect({ className, size = 'default', ...props }: NativeSelectProps) {
  return (
    <div
      className={cn('group/native-select relative w-fit', className)}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="h-12 w-full min-w-0 cursor-pointer appearance-none rounded-2xl border border-input bg-neutral-0 ps-4 pe-8 py-0 text-base/[3rem] text-foreground transition-colors outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-400 focus-visible:border-2 focus-visible:border-primary aria-invalid:border-2 aria-invalid:border-destructive disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-100 data-[size=sm]:h-10 data-[size=sm]:rounded-xl data-[size=sm]:text-sm/10 dark:bg-neutral-900 dark:disabled:bg-neutral-800"
        {...props}
      />
      <AppIcon
        name="native-select.chevron"
        className="text-muted-600 pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot="native-select-option"
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  )
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
