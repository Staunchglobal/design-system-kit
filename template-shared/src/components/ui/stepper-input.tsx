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
    const base = value ?? min ?? 0
    onChange(clamp(base + delta, min, max))
  }

  function handleChange(raw: string) {
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
    <InputGroup data-slot="stepper-input" className={cn('w-36', className)}>
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          type="button"
          size="icon-xs"
          variant="ghost"
          disabled={disabled || atMin}
          aria-label="Decrease"
          onClick={() => bump(-step)}
        >
          <Minus className="size-3.5" />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        type="number"
        inputMode="numeric"
        disabled={disabled}
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        onChange={(e) => handleChange(e.target.value)}
        className={cn('text-center tabular-nums', inputClassName)}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          variant="ghost"
          disabled={disabled || atMax}
          aria-label="Increase"
          onClick={() => bump(step)}
        >
          <Plus className="size-3.5" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { StepperInput }
export type { StepperInputProps }
