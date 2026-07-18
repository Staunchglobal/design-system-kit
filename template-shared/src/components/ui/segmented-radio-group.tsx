'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type SegmentedRadioOption<T extends string> = {
  value: T
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

type SegmentedRadioGroupProps<T extends string> = {
  options: SegmentedRadioOption<T>[]
  value: T
  onValueChange: (value: T) => void
  name?: string
  id?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

function SegmentedRadioGroup<T extends string>({
  options,
  value,
  onValueChange,
  name,
  id,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
}: SegmentedRadioGroupProps<T>) {
  const generatedId = React.useId()
  const baseId = id ?? name ?? generatedId

  return (
    <div data-slot="segmented-radio-group" className={className}>
      <RadioGroup
        value={value}
        onValueChange={(v) => onValueChange(v as T)}
        name={name}
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        className="gap-2"
      >
        {options.map((option) => {
        const isSelected = value === option.value
        const optionDisabled = disabled || option.disabled
        const labelId = `${baseId}-label-${option.value}`

        return (
          <label
            key={option.value}
            data-slot="segmented-radio-item"
            data-selected={isSelected ? '' : undefined}
            data-disabled={optionDisabled ? '' : undefined}
            htmlFor={`${baseId}-${option.value}`}
            className={cn(
              'border-border hover:bg-muted/50 flex w-full cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
              isSelected && 'border-primary bg-primary/5',
              optionDisabled && 'pointer-events-none cursor-not-allowed opacity-50'
            )}
          >
            <RadioGroupItem
              id={`${baseId}-${option.value}`}
              value={option.value}
              disabled={optionDisabled}
              aria-labelledby={labelId}
              className="mt-0.5 shrink-0"
            />
            <div className="flex flex-col gap-0.5">
              <span
                id={labelId}
                data-slot="segmented-radio-item-label"
                className="font-medium leading-snug"
              >
                {option.label}
              </span>
              {option.description && (
                <span
                  data-slot="segmented-radio-item-description"
                  className="text-muted-foreground text-sm leading-normal font-normal"
                >
                  {option.description}
                </span>
              )}
            </div>
          </label>
        )
        })}
      </RadioGroup>
    </div>
  )
}

export { SegmentedRadioGroup }
export type { SegmentedRadioOption, SegmentedRadioGroupProps }
