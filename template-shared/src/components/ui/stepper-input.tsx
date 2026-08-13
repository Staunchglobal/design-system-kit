'use client'

import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

function clamp(n: number, min?: number, max?: number): number {
  let result = n
  if (min != null && result < min) result = min
  if (max != null && result > max) result = max
  return result
}

type StepperInputProps = {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  inputClassName?: string
}

function StepperInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  className,
  inputClassName,
}: StepperInputProps) {
  function bump(delta: number) {
    if (disabled) return
    const base = value ?? min ?? 0
    const next = clamp(base + delta, min, max)
    // Avoid redundant updates at the bounds (prevents focus/disabled flicker).
    if (next === value) return
    onChange(next)
  }

  function handleChange(raw: string) {
    if (disabled) return
    if (raw === '' || raw === '-') {
      onChange(null)
      return
    }
    const n = Number(raw)
    if (Number.isNaN(n)) return
    onChange(clamp(n, min, max))
  }

  const atMin = value != null && min != null && value <= min
  const atMax = value != null && max != null && value >= max

  return (
    <InputGroup
      data-slot="stepper-input"
      data-disabled={disabled || undefined}
      className={cn(
        'h-11 w-36 gap-2 px-3 focus-within:border focus-within:border-input has-[[data-slot=input]:focus-visible]:border-2 has-[[data-slot=input]:focus-visible]:border-primary-800 has-[[data-slot][aria-invalid=true]]:border has-disabled:bg-neutral-50 [&_[data-slot=button]]:text-muted-600 dark:has-[[data-slot=input]:focus-visible]:border-primary-400 dark:[&_[data-slot=button]]:text-muted-400',
        className
      )}
    >
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          type="button"
          size="icon-xs"
          variant="ghost"
          disabled={disabled || atMin}
          aria-label="Decrease"
          onClick={() => bump(-step)}
          className="size-6 rounded-md p-0 hover:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] hover:text-foreground disabled:text-muted-500 disabled:opacity-100 dark:hover:bg-[color-mix(in_oklab,var(--primary)_18%,transparent)]"
        >
          <Minus className="size-6" />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        type="number"
        inputMode="numeric"
        disabled={disabled}
        readOnly={disabled}
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          // Block typing when disabled even if a browser still delivers keys.
          if (disabled) e.preventDefault()
        }}
        className={cn(
          'text-center tabular-nums disabled:text-muted-500 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
          inputClassName
        )}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          variant="ghost"
          disabled={disabled || atMax}
          aria-label="Increase"
          onClick={() => bump(step)}
          className="size-6 rounded-md p-0 hover:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] hover:text-foreground disabled:text-muted-500 disabled:opacity-100 dark:hover:bg-[color-mix(in_oklab,var(--primary)_18%,transparent)]"
        >
          <Plus className="size-6" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { StepperInput }
export type { StepperInputProps }
