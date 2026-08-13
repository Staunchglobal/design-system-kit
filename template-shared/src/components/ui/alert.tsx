import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  "group/alert relative grid w-full gap-x-3 gap-y-0 rounded-3xl border-0 px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] [&>svg]:col-start-1 [&>svg]:row-start-1 [&>svg]:self-start [&>svg]:stroke-2 [&>svg]:text-current *:[svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: 'bg-neutral-50 text-muted-600 dark:bg-neutral-900 dark:text-neutral-400',
        destructive:
          'bg-destructive-50 text-destructive-500 *:data-[slot=alert-description]:text-destructive-500 *:[svg]:text-current dark:bg-destructive-950 dark:text-destructive-400 dark:*:data-[slot=alert-description]:text-destructive-400',
        success:
          'bg-success-50 text-success-500 *:data-[slot=alert-description]:text-success-500 *:[svg]:text-current dark:bg-success-950 dark:text-success-400 dark:*:data-[slot=alert-description]:text-success-400',
        warning:
          'bg-warning-50 text-warning-600 *:data-[slot=alert-description]:text-warning-600 *:[svg]:text-current dark:bg-warning-950 dark:text-warning-400 dark:*:data-[slot=alert-description]:text-warning-400',
        info: 'bg-info-50 text-info-500 *:data-[slot=alert-description]:text-info-500 *:[svg]:text-current dark:bg-info-950 dark:text-info-400 dark:*:data-[slot=alert-description]:text-info-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        '[&_a]:hover:text-foreground font-sans text-base font-medium group-data-[variant=default]/alert:text-foreground group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3',
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-600 group-has-[>svg]/alert:col-start-2 [&_a]:hover:text-foreground text-sm text-balance md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-action" className={cn('absolute top-3 right-3', className)} {...props} />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
