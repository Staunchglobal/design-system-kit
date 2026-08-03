'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export function formatPhoneMask(raw: string, pattern: string): string {
  const digits = raw.replace(/\D/g, '')
  let digitIndex = 0
  let result = ''

  for (const char of pattern) {
    if (digitIndex >= digits.length) break
    if (char === '#') {
      result += digits[digitIndex++]
    } else {
      result += char
    }
  }

  return result
}

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  pattern?: string
  label?: React.ReactNode
  disabled?: boolean
  className?: string
  inputClassName?: string
  id?: string
  placeholder?: string
}

function PhoneInput({
  value,
  onChange,
  pattern = '+61#########',
  label,
  disabled = false,
  className,
  inputClassName,
  id,
  placeholder,
}: PhoneInputProps) {
  const inputId = React.useId()
  const resolvedId = id ?? inputId

  function handleChange(raw: string) {
    onChange(formatPhoneMask(raw, pattern))
  }

  return (
    <div data-slot="phone-input" className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={resolvedId} className="text-sm font-medium">
          {label}
        </label>
      ) : null}
      <Input
        id={resolvedId}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        disabled={disabled}
        value={value}
        placeholder={placeholder ?? pattern.replace(/#/g, '0')}
        onChange={(e) => handleChange(e.target.value)}
        className={inputClassName}
      />
    </div>
  )
}

export { PhoneInput }
export type { PhoneInputProps }
