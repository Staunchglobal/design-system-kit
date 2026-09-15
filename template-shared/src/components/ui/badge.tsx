'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// Shape/typography ported from saferHealth-web's badge (constants.ts
// baseClass: tight rounded-full chip, text-xxs, 5px/2px padding — much
// smaller/tighter than this kit's previous h-6/text-xs pill). Variant
// NAMES are kept as this kit's existing shadcn-style set (default/
// secondary/destructive/success/warning/info/outline/ghost/link — used
// across crud-screen, user-management-screen, delivery-logs-screen,
// audit-trail-screen, etc.) rather than renamed to saferHealth's
// neutral/primary/primary-light/rosy/info/info-light/error/error-light,
// each mapped to its closest saferHealth-style visual counterpart via
// the kit's token classes.
const badgeVariants = cva(
  "group/badge inline-flex h-fit w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-[5px] py-[2px] text-xxs font-medium whitespace-nowrap select-none has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-50 text-primary-700 [&_a:hover]:bg-primary-100 dark:bg-primary-950 dark:text-primary-400 dark:[&_a:hover]:bg-primary-900',
        secondary:
          'border-transparent bg-neutral-100 text-foreground [&_a:hover]:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:[&_a:hover]:bg-neutral-700',
        destructive:
          'border-transparent bg-destructive-50 text-destructive-700 [&_a:hover]:bg-destructive-100 dark:bg-destructive-950 dark:text-destructive-400 dark:[&_a:hover]:bg-destructive-900',
        success:
          'border-transparent bg-success-50 text-success-700 [&_a:hover]:bg-success-100 dark:bg-success-950 dark:text-success-400 dark:[&_a:hover]:bg-success-900',
        warning:
          'border-transparent bg-warning-50 text-warning-700 [&_a:hover]:bg-warning-100 dark:bg-warning-950 dark:text-warning-400 dark:[&_a:hover]:bg-warning-900',
        info: 'border-transparent bg-info-50 text-info-700 [&_a:hover]:bg-info-100 dark:bg-info-950 dark:text-info-400 dark:[&_a:hover]:bg-info-900',
        outline:
          'bg-neutral-0 border-border text-foreground [&_a:hover]:bg-muted [&_a:hover]:text-muted-foreground dark:bg-neutral-900',
        ghost: 'border-0 bg-transparent text-foreground hover:bg-muted hover:text-muted-foreground',
        link: 'border-transparent bg-transparent text-accent-700 underline-offset-4 hover:text-accent-500 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// Solid dot color per variant — ported from saferHealth-web's dotVariantClass,
// used by the new `dot` prop below (saferHealth's compact status-dot badge).
const dotVariants = cva('inline-block size-3 shrink-0 rounded-full', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-neutral-400',
      destructive: 'bg-destructive-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      info: 'bg-info-500',
      outline: 'bg-neutral-400',
      ghost: 'bg-neutral-400',
      link: 'bg-accent-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function getBadgeContent(children: React.ReactNode) {
  if (typeof children === 'string') {
    return children.trim()
  }
  return children
}

function Badge({
  className,
  variant = 'default',
  dot = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; dot?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  if (dot) {
    // `className` is merged last via `cn` (tailwind-merge), so a caller-supplied
    // `bg-*` class already wins over the variant's default dot color here.
    return (
      <Comp
        data-slot="badge"
        data-variant={variant}
        className={cn(dotVariants({ variant }), className)}
        {...props}
      />
    )
  }

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {getBadgeContent(children)}
    </Comp>
  )
}

export { Badge, badgeVariants, dotVariants }
