import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const textareaVariants = cva(
  "flex field-sizing-content w-full min-w-0 resize-none border border-input bg-neutral-0 text-foreground shadow-none transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground [scrollbar-width:thin] [scrollbar-color:var(--color-neutral-400)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:border-neutral-400 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary-100 focus-visible:hover:border-primary focus-visible:hover:ring-primary-100 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none disabled:hover:border-transparent aria-invalid:border-destructive-700 aria-invalid:hover:border-destructive-700 aria-invalid:focus-visible:border-destructive-700 aria-invalid:focus-visible:ring-destructive-100 aria-invalid:focus-visible:hover:border-destructive-700 dark:bg-neutral-900 dark:disabled:bg-neutral-800",
  {
    variants: {
      size: {
        sm: 'min-h-32 rounded-sm px-3 py-1.5 text-sm',
        md: 'min-h-36 rounded-md px-3 py-2 text-sm',
        lg: 'min-h-40 rounded-lg px-3 py-2.5 text-sm',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
)

function Textarea({
  className,
  size = 'lg',
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      {...props}
      data-slot="textarea"
      data-size={size}
      className={cn(textareaVariants({ size }), className)}
    />
  )
}

export { Textarea, textareaVariants }
