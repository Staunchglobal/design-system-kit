import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const tagVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border font-medium whitespace-nowrap select-none',
  {
    variants: {
      variant: {
        default: 'border-border bg-neutral-100 text-foreground dark:bg-neutral-800 dark:text-neutral-100',
        primary: 'border-primary-200 bg-primary-50 text-primary-600 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-400',
        destructive:
          'border-destructive-200 bg-destructive-50 text-destructive-700 dark:border-destructive-900 dark:bg-destructive-950 dark:text-destructive-400',
        success:
          'border-success-200 bg-success-50 text-success-700 dark:border-success-900 dark:bg-success-950 dark:text-success-400',
        warning:
          'border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-900 dark:bg-warning-950 dark:text-warning-400',
        info: 'border-info-200 bg-info-50 text-info-700 dark:border-info-900 dark:bg-info-950 dark:text-info-400',
      },
      size: {
        sm: 'px-1.5 py-1 text-xs',
        lg: 'px-2 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
)

const dotVariants: Record<NonNullable<VariantProps<typeof tagVariants>['variant']>, string> = {
  default: 'bg-foreground',
  primary: 'bg-primary-600 dark:bg-primary-400',
  destructive: 'bg-destructive-700 dark:bg-destructive-400',
  success: 'bg-success-700 dark:bg-success-400',
  warning: 'bg-warning-700 dark:bg-warning-400',
  info: 'bg-info-700 dark:bg-info-400',
}

type TagProps = React.ComponentProps<'span'> &
  VariantProps<typeof tagVariants> & {
    /** Shows a small status dot before the label. Defaults to true. */
    showDot?: boolean
  }

function Tag({ className, showDot = true, size = 'sm', variant = 'default', children, ...props }: TagProps) {
  return (
    <span
      data-slot="tag"
      data-size={size}
      data-variant={variant}
      className={cn(tagVariants({ variant, size }), className)}
      {...props}
    >
      {showDot ? (
        <span
          aria-hidden
          data-slot="tag-dot"
          className={cn('size-1.5 shrink-0 rounded-full', dotVariants[variant ?? 'default'])}
        />
      ) : null}
      <span data-slot="tag-label">{children}</span>
    </span>
  )
}

export { Tag, tagVariants }
export type { TagProps }
