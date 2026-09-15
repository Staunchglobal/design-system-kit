import * as React from 'react'
import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'

type StepState = 'upcoming' | 'active' | 'complete' | 'error'

type StepperProps = {
  variant?: 'circles' | 'segments'
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children?: React.ReactNode
  currentStep?: number
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
  const connectorActive = state === 'complete' || state === 'active'

  return (
    <div
      data-slot="stepper-item"
      data-state={state}
      data-orientation={orientation}
      className={cn(
        'flex',
        vertical ? 'gap-3' : 'relative min-w-0 flex-1 flex-col items-center gap-2',
        className
      )}
    >
      <div
        data-slot="stepper-indicator-row"
        className={cn(
          'relative flex items-center justify-center',
          vertical ? 'flex-col' : 'w-full'
        )}
      >
        <div
          data-slot="stepper-indicator"
          className={cn(
            'relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors',
            state === 'upcoming' &&
              'border-border bg-card text-muted-foreground hover:bg-neutral-100',
            state === 'active' && 'border-primary-500 bg-primary-500 text-primary-foreground',
            state === 'complete' && 'border-transparent bg-success-50 text-success-700',
            state === 'error' && 'border-transparent bg-destructive-50 text-destructive-700'
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
            aria-hidden
            className={cn(
              'bg-neutral-200 dark:bg-neutral-700',
              vertical
                ? 'mt-2 h-8 w-px'
                :
                  'absolute top-1/2 left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] h-px -translate-y-1/2',
              connectorActive && 'bg-primary-500'
            )}
          />
        ) : null}
      </div>

      <div
        data-slot="stepper-copy"
        className={cn(!vertical && 'w-full text-center', vertical && 'min-w-0 pt-0.5')}
      >
        <p data-slot="stepper-label" className="text-foreground text-sm font-medium">
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
