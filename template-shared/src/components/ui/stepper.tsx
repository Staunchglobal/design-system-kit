import * as React from 'react'
import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'

type StepState = 'upcoming' | 'active' | 'complete' | 'error'

type StepperProps = {
  variant?: 'circles' | 'segments'
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children?: React.ReactNode
  /** Used by the `segments` variant. */
  currentStep?: number
  /** Used by the `segments` variant. */
  totalSteps?: number
}

type StepperItemProps = {
  state?: StepState
  label: React.ReactNode
  description?: React.ReactNode
  isLast?: boolean
  stepNumber?: number
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

function StepperItem({
  state = 'upcoming',
  label,
  description,
  isLast = false,
  stepNumber = 1,
  className,
  orientation = 'horizontal',
}: StepperItemProps) {
  const vertical = orientation === 'vertical'

  return (
    <div
      data-slot="stepper-item"
      data-state={state}
      data-orientation={orientation}
      className={cn(
        'flex',
        vertical ? 'gap-3' : 'min-w-0 flex-1 flex-col items-center gap-2',
        className
      )}
    >
      <div className={cn('flex items-center', vertical ? 'flex-col' : 'w-full')}>
        <div
          data-slot="stepper-indicator"
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors',
            state === 'upcoming' && 'border-border bg-background text-muted-foreground',
            state === 'active' && 'border-primary bg-primary text-primary-foreground',
            state === 'complete' && 'border-primary bg-primary text-primary-foreground',
            state === 'error' && 'border-destructive bg-destructive text-destructive-foreground'
          )}
        >
          {state === 'complete' ? (
            <Check className="size-4" />
          ) : state === 'error' ? (
            <X className="size-4" />
          ) : (
            stepNumber
          )}
        </div>
        {!isLast ? (
          <div
            data-slot="stepper-connector"
            className={cn(
              'bg-border',
              vertical ? 'mt-2 h-8 w-px' : 'mx-2 h-px flex-1',
              (state === 'complete' || state === 'active') && 'bg-primary'
            )}
          />
        ) : null}
      </div>
      <div className={cn(!vertical && 'text-center')}>
        <p
          data-slot="stepper-label"
          className={cn(
            'text-sm font-medium',
            state === 'upcoming' && 'text-muted-foreground',
            state === 'error' && 'text-destructive'
          )}
        >
          {label}
        </p>
        {description ? (
          <p data-slot="stepper-description" className="text-muted-foreground mt-0.5 text-xs">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function Stepper({
  variant = 'circles',
  orientation = 'horizontal',
  className,
  children,
  currentStep = 1,
  totalSteps = 3,
}: StepperProps) {
  if (variant === 'segments') {
    const total = Math.max(1, totalSteps)
    const current = Math.min(Math.max(1, currentStep), total)
    return (
      <div
        data-slot="stepper"
        data-variant="segments"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        className={cn('flex w-full gap-1.5', className)}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            data-slot="stepper-segment"
            data-active={i < current ? '' : undefined}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < current ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    )
  }

  const items = React.Children.toArray(children).filter(React.isValidElement)
  return (
    <div
      data-slot="stepper"
      data-variant="circles"
      data-orientation={orientation}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col gap-0' : 'w-full items-start',
        className
      )}
    >
      {items.map((child, index) =>
        React.cloneElement(child as React.ReactElement<StepperItemProps>, {
          stepNumber: (child.props as StepperItemProps).stepNumber ?? index + 1,
          isLast: (child.props as StepperItemProps).isLast ?? index === items.length - 1,
          orientation,
        })
      )}
    </div>
  )
}

export { Stepper, StepperItem }
export type { StepperProps, StepperItemProps, StepState }
