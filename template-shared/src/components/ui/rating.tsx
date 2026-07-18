'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type RatingProps = {
  value: number
  onValueChange?: (value: number) => void
  max?: number
  disabled?: boolean
  readOnly?: boolean
  name?: string
  id?: string
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

function Rating({
  value,
  onValueChange,
  max = 10,
  disabled = false,
  readOnly = false,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}: RatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const groupId = React.useId()
  const resolvedId = id ?? groupId
  const normalizedMax = Number.isFinite(max) ? Math.max(1, Math.floor(max)) : 10

  const interactive = !disabled && !readOnly && onValueChange != null

  const filled = hovered ?? value

  return (
    <div
      data-slot="rating"
      role="radiogroup"
      id={resolvedId}
      aria-label={ariaLabel ?? 'Rating'}
      aria-describedby={ariaDescribedby}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      className={cn(
        'flex items-center gap-0.5',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {Array.from({ length: normalizedMax }, (_, i) => {
        const segValue = i + 1
        const isSelected = value === segValue
        const isFilled = segValue <= filled

        return (
          <button
            key={segValue}
            type="button"
            role="radio"
            data-slot="rating-segment"
            aria-checked={isSelected}
            aria-label={`${segValue} out of ${normalizedMax}`}
            name={name ?? resolvedId}
            tabIndex={isSelected || (value === 0 && segValue === 1) ? 0 : -1}
            disabled={!interactive}
            data-filled={isFilled ? '' : undefined}
            data-selected={isSelected ? '' : undefined}
            onMouseEnter={() => {
              if (interactive) setHovered(segValue)
            }}
            onMouseLeave={() => {
              if (interactive) setHovered(null)
            }}
            onFocus={() => {
              if (interactive) setHovered(segValue)
            }}
            onBlur={() => {
              if (interactive) setHovered(null)
            }}
            onClick={() => {
              if (interactive) onValueChange(segValue)
            }}
            onKeyDown={(e) => {
              if (!interactive) return
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault()
                const next = Math.min(segValue + 1, normalizedMax)
                onValueChange(next)
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault()
                const prev = Math.max(segValue - 1, 1)
                onValueChange(prev)
              } else if (e.key === 'Home') {
                e.preventDefault()
                onValueChange(1)
              } else if (e.key === 'End') {
                e.preventDefault()
                onValueChange(normalizedMax)
              }
            }}
            className={cn(
              'relative h-7 flex-1 rounded-sm border transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              isFilled
                ? 'border-primary bg-primary'
                : 'border-border bg-muted/30 hover:bg-muted',
              interactive ? 'cursor-pointer' : 'cursor-default'
            )}
          >
            <span className="sr-only">{segValue}</span>
          </button>
        )
      })}
    </div>
  )
}

export { Rating }
export type { RatingProps }
