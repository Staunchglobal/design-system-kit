'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const buttonGroupVariants = cva(
  "group/button-group isolate flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        // Joined-border look: each non-edge child loses the radius on its shared side and
        // overlaps its neighbor by 1px (border-l-0 avoids a doubled-up 2px seam); the two
        // edge children keep a full pill on their outer corner. `!` (not plain :not(:first-child)
        // vs. size-variant specificity) mirrors the `!important` this replaces — see button-group.css's
        // former [data-orientation] rules, now folded in here instead of a separate stylesheet.
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none! [&>*:not(:first-child)]:border-l-0 [&>*:not(:first-child)]:-ml-px [&>*:not(:last-child)]:rounded-r-none! [&>*:first-child]:rounded-l-full! [&>*:last-child]:rounded-r-full! [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none! [&>*:not(:first-child)]:border-t-0 [&>*:not(:first-child)]:-mt-px [&>*:not(:last-child)]:rounded-b-none! [&>*:first-child]:rounded-t-full! [&>*:last-child]:rounded-b-full! [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!",
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      className={cn(
        "bg-neutral-100 border-neutral-200 flex items-center gap-2 rounded-lg border px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'bg-neutral-200 relative self-stretch data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto data-vertical:w-px',
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }