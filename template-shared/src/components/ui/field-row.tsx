'use client'

import * as React from 'react'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type FieldRowProps = {
  label: React.ReactNode
  description?: React.ReactNode
  value?: React.ReactNode
  editable?: boolean
  showChevron?: boolean
  onPress?: () => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

function FieldRow({
  label,
  description,
  value,
  editable = true,
  showChevron = false,
  onPress,
  disabled = false,
  className,
  children,
}: FieldRowProps) {
  const isInteractive = onPress != null && !disabled

  return (
    <div
      data-slot="field-row"
      data-editable={editable}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onClick={isInteractive ? onPress : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onPress()
              }
            }
          : undefined
      }
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-sm',
        isInteractive &&
          'cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <div data-slot="field-row-content" className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div data-slot="field-row-label" className="font-medium leading-snug">
          {label}
        </div>
        {description && (
          <div
            data-slot="field-row-description"
            className="text-muted-foreground text-sm leading-normal font-normal"
          >
            {description}
          </div>
        )}
      </div>
      {(value != null || children != null || showChevron) && (
        <div
          data-slot="field-row-end"
          className="flex shrink-0 items-center gap-2 text-muted-foreground"
        >
          {value != null && (
            <span data-slot="field-row-value" className="text-sm">
              {value}
            </span>
          )}
          {children}
          {showChevron ? <ChevronRight data-slot="field-row-chevron" className="size-4" /> : null}
        </div>
      )}
    </div>
  )
}

type FieldRowGroupProps = {
  title?: React.ReactNode
  className?: string
  children: React.ReactNode
}

function FieldRowGroup({ title, className, children }: FieldRowGroupProps) {
  const items = React.Children.toArray(children).filter(Boolean)

  return (
    <div data-slot="field-row-group" className={cn('space-y-2', className)}>
      {title ? (
        <div data-slot="field-row-group-title" className="px-1 text-sm font-medium">
          {title}
        </div>
      ) : null}
      <Card className="gap-0 py-0">
        {items.map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div data-slot="field-row-group-separator" className="px-4">
                <Separator />
              </div>
            )}
            {child}
          </React.Fragment>
        ))}
      </Card>
    </div>
  )
}

export { FieldRow, FieldRowGroup }
export type { FieldRowProps, FieldRowGroupProps }
