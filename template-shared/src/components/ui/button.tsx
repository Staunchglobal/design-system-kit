'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-3 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive-600 dark:aria-invalid:ring-destructive-400 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-500 text-neutral-0 hover:bg-primary-600 active:bg-primary-700 focus-visible:border-primary-500 focus-visible:ring-primary-500/45 dark:bg-primary-400 dark:text-primary-950 dark:hover:bg-primary-300 dark:active:bg-primary-500 dark:focus-visible:border-primary-400 dark:focus-visible:ring-primary-400/45',
        outline:
          'border-neutral-200 bg-neutral-0 text-primary-950 hover:bg-neutral-50 active:bg-neutral-100 aria-expanded:bg-neutral-50 focus-visible:border-primary-500 focus-visible:ring-primary-500/45 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:aria-expanded:bg-neutral-800 dark:focus-visible:border-primary-400 dark:focus-visible:ring-primary-400/45',
        secondary:
          'border-transparent bg-secondary-500 text-primary-950 hover:bg-secondary-600 active:bg-secondary-700 focus-visible:border-secondary-500 focus-visible:ring-secondary-500/45 dark:bg-secondary-400 dark:hover:bg-secondary-300 dark:active:bg-secondary-500 dark:focus-visible:border-secondary-400 dark:focus-visible:ring-secondary-400/45',
        ghost:
          'border-transparent bg-transparent text-primary-950 hover:bg-neutral-50 active:bg-neutral-100 aria-expanded:bg-neutral-50 focus-visible:border-primary-500 focus-visible:ring-primary-500/45 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:aria-expanded:bg-neutral-800 dark:focus-visible:border-primary-400 dark:focus-visible:ring-primary-400/45',
        destructive:
          'border-destructive-300 bg-destructive-50 text-destructive-500 hover:bg-destructive-100 active:bg-destructive-200 focus-visible:border-destructive-500 focus-visible:ring-destructive-500/45 dark:border-destructive-700 dark:bg-destructive-950 dark:text-destructive-400 dark:hover:bg-destructive-900 dark:active:bg-destructive-800 dark:focus-visible:border-destructive-400 dark:focus-visible:ring-destructive-400/45',
        link: 'border-transparent bg-transparent text-primary-500 underline-offset-4 hover:text-primary-400 hover:underline active:text-primary-700 focus-visible:border-primary-500 focus-visible:ring-primary-500/45 dark:text-primary-400 dark:hover:text-primary-300 dark:active:text-primary-500 dark:focus-visible:border-primary-400 dark:focus-visible:ring-primary-400/45',
      },
      size: {
        default:
          'h-12 gap-1.5 px-4 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-8 gap-1 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 gap-1 px-3 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-14 gap-2 px-6 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-12',
        'icon-xs': "size-8 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-10',
        'icon-lg': 'size-14',
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        class:
          'h-auto w-auto p-0 has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0',
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
