'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const chipVariants = cva(
  'group/chip inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-border bg-neutral-0 font-medium whitespace-nowrap text-foreground outline-none transition-colors select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-neutral-100 disabled:text-neutral-400 data-selected:border-primary data-selected:bg-primary-50 data-selected:hover:border-primary data-selected:hover:bg-primary-50 dark:bg-neutral-900 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500 dark:data-selected:bg-primary-950 [&>svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        input: 'bg-muted hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
      },
      size: {
        sm: 'h-7 gap-1 px-2 py-1 text-xs [&_svg]:size-3.5',
        lg: 'h-9 gap-1.5 px-2.5 py-1.5 text-sm [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
)

type ChipProps = Omit<React.ComponentProps<'button'>, 'onClick'> &
  VariantProps<typeof chipVariants> & {
    asChild?: boolean
    /** Marks the chip as the active/toggled-on choice in a chip group. */
    selected?: boolean
    /** Icon or element shown before the label. */
    leftAdornment?: React.ReactNode
    /** Count shown after the label, rendered inside a small pill. */
    count?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    /** Renders a trailing remove (×) button; called when it's activated. */
    onRemove?: React.MouseEventHandler<HTMLButtonElement>
    removeLabel?: string
  }

function Chip({
  asChild = false,
  children,
  className,
  count,
  disabled,
  leftAdornment,
  onClick,
  onRemove,
  removeLabel,
  selected,
  size = 'sm',
  type = 'button',
  variant = 'default',
  ...props
}: ChipProps) {
  const Comp = asChild ? Slot.Root : 'button'
  const resolvedRemoveLabel =
    removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')

  function handleRemove(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onRemove?.(event)
  }

  return (
    <Comp
      data-slot="chip"
      data-variant={variant}
      data-selected={selected || undefined}
      aria-pressed={onClick ? selected : undefined}
      disabled={disabled}
      type={asChild ? undefined : type}
      onClick={onClick}
      className={cn(chipVariants({ variant, size }), onClick && 'cursor-pointer', className)}
      {...props}
    >
      {leftAdornment ? (
        <span
          data-slot="chip-adornment"
          className="inline-flex shrink-0 items-center justify-center"
        >
          {leftAdornment}
        </span>
      ) : null}
      <span data-slot="chip-label">{children}</span>
      {count != null ? (
        <span
          data-slot="chip-count"
          className="bg-primary-100 text-primary-700 group-data-selected/chip:bg-primary group-data-selected/chip:text-primary-foreground inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[0.625rem] leading-none font-medium dark:bg-primary-900 dark:text-primary-300"
        >
          {count}
        </span>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          data-slot="chip-remove"
          aria-label={resolvedRemoveLabel}
          disabled={disabled}
          onClick={handleRemove}
          className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-inherit opacity-70 outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </Comp>
  )
}

export { Chip, chipVariants }
export type { ChipProps }
