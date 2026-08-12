import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-36 w-full rounded-3xl border border-input bg-neutral-0 px-4 py-3 text-base text-foreground transition-colors outline-none placeholder:text-muted-400 focus-visible:border-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-neutral-100 aria-invalid:border-2 aria-invalid:border-destructive dark:bg-neutral-900 dark:disabled:bg-neutral-800',
        className
      )}
    />
  )
}

export { Textarea }
