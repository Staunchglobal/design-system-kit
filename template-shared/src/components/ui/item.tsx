'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        'group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2',
        className
      )}
      {...props}
    />
  )
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('my-2', className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  'group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 [a]:transition-colors [a]:hover:bg-muted',
  {
    variants: {
      variant: {
        default: 'border-transparent',
        outline: 'border-border',
        muted: 'border-transparent bg-neutral-100 dark:bg-neutral-800',
      },
      size: {
        default: 'gap-2.5 px-3 py-2.5',
        sm: 'gap-2 px-2.5 py-2',
        xs: 'gap-1.5 px-2 py-1.5 in-data-[slot=dropdown-menu-content]:p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Item({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          'size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        'flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none',
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        'line-clamp-1 flex w-fit items-center gap-2 font-sans text-sm leading-5 font-medium underline-offset-4',
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary line-clamp-2 text-left text-sm leading-5 font-normal group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4',
        className
      )}
      {...props}
    />
  )
}

// Icon buttons dropped into a row must fit the item's own height — Button's
// icon/icon-sm/icon-xs sizes (2.5rem/2.25rem/2rem) would otherwise overflow a
// 0.625rem/0.5rem/0.375rem-padded row, so every icon-sized Button placed here
// is clamped to 1.5rem (1.25rem inside an `xs`-sized Item).
const ITEM_ACTIONS_ICON_BUTTON_CLASS =
  '[&_[data-slot=button][data-size=icon]]:size-6 [&_[data-slot=button][data-size=icon]]:min-w-6 [&_[data-slot=button][data-size=icon]]:min-h-6 [&_[data-slot=button][data-size=icon]]:p-0 [&_[data-slot=button][data-size=icon-sm]]:size-6 [&_[data-slot=button][data-size=icon-sm]]:min-w-6 [&_[data-slot=button][data-size=icon-sm]]:min-h-6 [&_[data-slot=button][data-size=icon-sm]]:p-0 [&_[data-slot=button][data-size=icon-xs]]:size-6 [&_[data-slot=button][data-size=icon-xs]]:min-w-6 [&_[data-slot=button][data-size=icon-xs]]:min-h-6 [&_[data-slot=button][data-size=icon-xs]]:p-0 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon]]:size-5 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon]]:min-w-5 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon]]:min-h-5 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon-sm]]:size-5 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon-sm]]:min-w-5 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon-sm]]:min-h-5 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon-xs]]:size-5 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon-xs]]:min-w-5 group-data-[size=xs]/item:[&_[data-slot=button][data-size=icon-xs]]:min-h-5'

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex items-center gap-2', ITEM_ACTIONS_ICON_BUTTON_CLASS, className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-header"
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-footer"
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}