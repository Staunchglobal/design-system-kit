'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-full p-0 text-foreground group-data-horizontal/tabs:h-auto group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent gap-2',
        line: 'relative gap-0 bg-transparent items-stretch border-b border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "text-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:outline-ring relative inline-flex h-[calc(100%-1px)] min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'group-data-[variant=default]/tabs-list:bg-neutral-100 group-data-[variant=default]/tabs-list:border-neutral-200 dark:group-data-[variant=default]/tabs-list:bg-neutral-800 dark:group-data-[variant=default]/tabs-list:border-neutral-700',
        'group-data-[variant=default]/tabs-list:data-active:bg-neutral-0 group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:border-transparent group-data-[variant=default]/tabs-list:data-active:font-semibold group-data-[variant=default]/tabs-list:data-active:shadow-(--shadow-xs) dark:group-data-[variant=default]/tabs-list:data-active:bg-neutral-900',
        'group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-2 group-data-[variant=line]/tabs-list:min-h-auto group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:border-0 group-data-[variant=line]/tabs-list:relative group-data-[variant=line]/tabs-list:shadow-none group-data-[variant=line]/tabs-list:h-auto!',
        'group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-primary dark:group-data-[variant=line]/tabs-list:data-active:text-primary-400',
        'after:absolute after:opacity-0 after:transition-opacity group-data-[variant=line]/tabs-list:after:inset-x-0 group-data-[variant=line]/tabs-list:after:bottom-[-1px] group-data-[variant=line]/tabs-list:after:h-0.5 group-data-[variant=line]/tabs-list:after:z-1 group-data-[variant=line]/tabs-list:after:bg-primary dark:group-data-[variant=line]/tabs-list:after:bg-primary-400 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
