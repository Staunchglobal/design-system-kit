'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// Sizing/shape/color ported from saferHealth-web's button (constants.ts:
// baseClass/variantClass/sizeClass/iconSizeClass/glyphSizeClass). saferHealth's
// size scale is sm/md/lg/xl (+ icon-sm/md/lg/xl) — this kit's existing call
// sites already depend on xs/sm/default/lg (+ icon-xs/sm/icon/icon-lg), so
// sizes are kept under their existing names and rank-mapped onto saferHealth's
// scale (xs->sm, sm->md, default->lg, lg->xl) rather than renamed.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary-500/45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive-600 dark:aria-invalid:ring-destructive-400 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-primary text-primary-foreground hover:bg-primary-500 active:bg-primary-700 disabled:bg-neutral-200 disabled:text-neutral-500 dark:bg-primary-400 dark:text-primary-950 dark:hover:bg-primary-300 dark:active:bg-primary-500',
        outline:
          'border border-border bg-card text-foreground hover:bg-neutral-100 active:bg-neutral-200 disabled:border-transparent disabled:bg-neutral-200 disabled:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:active:bg-neutral-700',
        secondary:
          'border border-transparent bg-secondary-500 text-primary-950 hover:bg-secondary-600 active:bg-secondary-700 disabled:bg-neutral-200 disabled:text-neutral-500 dark:bg-secondary-400 dark:hover:bg-secondary-300 dark:active:bg-secondary-500',
        ghost:
          'border border-transparent bg-transparent text-muted-foreground hover:bg-neutral-100 active:bg-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:active:bg-neutral-700',
        destructive:
          'border border-destructive-200 bg-destructive-50 text-destructive-700 hover:border-transparent hover:bg-destructive-700 hover:text-primary-foreground active:border-transparent active:bg-destructive-900 active:text-primary-foreground disabled:border-transparent disabled:bg-neutral-200 disabled:text-neutral-500 dark:border-destructive-800 dark:bg-destructive-950 dark:text-destructive-400 dark:hover:bg-destructive-600',
        link: 'border-0 bg-transparent p-0 text-accent-700 underline underline-offset-4 hover:text-accent-500 active:text-accent-800 disabled:text-neutral-500 dark:text-accent-400 dark:hover:text-accent-300',
      },
      size: {
        default:
          "gap-1.5 rounded-[12px] px-[12px] py-[10px] text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-5",
        xs: "gap-1 rounded-[6px] px-[10px] py-[6px] text-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-4",
        sm: "gap-1 rounded-[8px] px-[12px] py-[8px] text-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "gap-2 rounded-[12px] px-[16px] py-[12px] text-base has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-[40px] rounded-[12px] [&_svg:not([class*='size-'])]:size-5",
        'icon-xs': "size-[32px] rounded-[6px] [&_svg:not([class*='size-'])]:size-4",
        'icon-sm': "size-[36px] rounded-[8px] [&_svg:not([class*='size-'])]:size-4",
        'icon-lg': "size-[48px] rounded-[12px] [&_svg:not([class*='size-'])]:size-5",
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        class:
          'h-auto w-auto rounded-none p-0 has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      {...props}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
    />
  )
}

export { Button, buttonVariants }
