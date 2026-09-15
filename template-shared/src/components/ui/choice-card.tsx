'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

const choiceCardVariants = cva(
  'group/choice-card relative box-border flex w-full cursor-pointer items-center gap-3 overflow-hidden border border-border bg-neutral-0 px-3 transition-colors select-none hover:bg-neutral-100 has-data-checked:border-primary has-data-checked:bg-primary-50 has-data-checked:hover:border-primary has-data-checked:hover:bg-primary-50 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary/35 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:has-data-checked:bg-primary-950 dark:has-data-checked:hover:bg-primary-950',
  {
    variants: {
      size: {
        default: 'rounded-lg py-2.5',
        sm: 'rounded-md py-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

type ChoiceCardType = 'checkbox' | 'radio' | 'switch'

type ChoiceCardProps = Omit<React.ComponentProps<'input'>, 'size' | 'type' | 'onChange'> &
  VariantProps<typeof choiceCardVariants> & {
    type?: ChoiceCardType
    checked?: boolean
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean) => void
    helperText?: React.ReactNode
  }

function ChoiceCard({
  children,
  className,
  checked,
  defaultChecked,
  disabled,
  helperText,
  id,
  name,
  onCheckedChange,
  size = 'default',
  type = 'checkbox',
  value,
  ...props
}: ChoiceCardProps) {
  const generatedId = React.useId()
  const controlId = id ?? generatedId

  const control =
    type === 'switch' ? (
      <Switch
        id={controlId}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    ) : type === 'radio' ? (
      <RadioGroupItem id={controlId} value={value as string} disabled={disabled} {...props} />
    ) : (
      <Checkbox
        id={controlId}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    )

  return (
    <label
      data-slot="choice-card"
      data-size={size}
      data-type={type}
      htmlFor={controlId}
      className={cn(choiceCardVariants({ size }), className)}
    >
      {control}
      <span
        data-slot="choice-card-content"
        className="text-foreground flex flex-1 flex-col gap-0.5 text-sm"
      >
        {children}
        {helperText ? (
          <span data-slot="choice-card-helper-text" className="text-muted-foreground text-sm">
            {helperText}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { ChoiceCard }
export type { ChoiceCardProps, ChoiceCardType }
