'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-50 text-primary-600 [&_a:hover]:bg-primary-100 dark:bg-primary-950 dark:text-primary-400 dark:[&_a:hover]:bg-primary-900',
        secondary:
          'border-transparent bg-neutral-100 text-foreground [&_a:hover]:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:[&_a:hover]:bg-neutral-700',
        destructive:
          'focus-visible:ring-destructive/20 border-transparent bg-destructive-50 text-destructive-500 [&_a:hover]:bg-destructive-100 dark:bg-destructive-950 dark:text-destructive-400 dark:[&_a:hover]:bg-destructive-900',
        success:
          'border-transparent bg-success-50 text-success-500 [&_a:hover]:bg-success-100 dark:bg-success-950 dark:text-success-400 dark:[&_a:hover]:bg-success-900',
        warning:
          'border-transparent bg-warning-50 text-warning-600 [&_a:hover]:bg-warning-100 dark:bg-warning-950 dark:text-warning-400 dark:[&_a:hover]:bg-warning-900',
        info: 'border-transparent bg-info-50 text-info-500 [&_a:hover]:bg-info-100 dark:bg-info-950 dark:text-info-400 dark:[&_a:hover]:bg-info-900',
        outline:
          'bg-neutral-0 border-border text-foreground [&_a:hover]:bg-muted [&_a:hover]:text-muted-foreground dark:bg-neutral-900',
        ghost: 'border-0 bg-transparent text-foreground hover:bg-muted hover:text-muted-foreground',
        link: 'border-transparent bg-transparent text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }