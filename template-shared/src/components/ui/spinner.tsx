import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/icons/icon'
import * as React from 'react'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <AppIcon
      name="spinner.loader"
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
