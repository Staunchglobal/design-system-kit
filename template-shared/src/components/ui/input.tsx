import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  "flex h-auto w-full min-w-0 border border-input bg-neutral-0 text-foreground shadow-none transition-[border-color,box-shadow] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-neutral-400 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary-100 focus-visible:hover:border-primary focus-visible:hover:ring-primary-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none disabled:hover:border-transparent aria-invalid:border-destructive-700 aria-invalid:hover:border-destructive-700 aria-invalid:focus-visible:border-destructive-700 aria-invalid:focus-visible:ring-destructive-100 aria-invalid:focus-visible:hover:border-destructive-700 dark:bg-neutral-900 dark:disabled:bg-neutral-800",
  {
    variants: {
      size: {
        sm: 'rounded-sm px-3 py-1.5 text-sm',
        md: 'rounded-md px-3 py-2 text-sm',
        lg: 'rounded-lg px-3 py-2.5 text-sm',
        xl: 'rounded-lg px-3 py-3 text-base',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
)

function Input({
  className,
  type,
  size = 'lg',
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      {...props}
      data-slot="input"
      data-size={size}
      className={cn(inputVariants({ size }), className)}
    />
  )
}

export { Input, inputVariants }
