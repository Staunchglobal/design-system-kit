import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      {...props}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-2xl border border-input bg-neutral-0 px-4 py-0 text-base/[3rem] text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground placeholder:text-muted-400 focus-visible:border-2 focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-100 aria-invalid:border-2 aria-invalid:border-destructive dark:bg-neutral-900 dark:disabled:bg-neutral-800",
        className
      )}
    />
  )
}

export { Input }
