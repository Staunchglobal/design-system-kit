'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

/** Digits that appear as literals in the pattern (e.g. `1` in `+1 (###) …`). */
function literalDigitsInPattern(pattern: string): string {
  return pattern.replace(/#/g, '').replace(/\D/g, '')
}

function slotCountInPattern(pattern: string): number {
  return (pattern.match(/#/g) ?? []).length
}

/**
 * Country / leading prefix before the first `#`, without trailing punctuation.
 * `+1 (###) ###-####` → `+1`
 */
export function phoneCountryPrefix(pattern: string): string {
  const hashIndex = pattern.indexOf('#')
  const leading = hashIndex === -1 ? pattern : pattern.slice(0, hashIndex)
  return leading.replace(/[\s().-]+$/g, '')
}

/** User-entered national digits only — strips a re-captured country-code prefix. */
export function phoneDigits(raw: string, pattern: string): string {
  const slotCount = slotCountInPattern(pattern)
  const literalDigits = literalDigitsInPattern(pattern)
  let digits = raw.replace(/\D/g, '')
  // Formatted values include literal digits (e.g. "+1 …" → "1…"). Strip them
  // so they aren't written into `#` slots on the next keystroke.
  if (literalDigits && digits.startsWith(literalDigits)) {
    digits = digits.slice(literalDigits.length)
  }
  return digits.slice(0, slotCount)
}

export function formatPhoneMask(raw: string, pattern: string): string {
  const digits = phoneDigits(raw, pattern)
  const prefix = phoneCountryPrefix(pattern)

  // No national digits yet — keep a bare country prefix (e.g. "+1") if present.
  if (!digits) {
    if (!raw.trim()) return ''
    const rawDigits = raw.replace(/\D/g, '')
    const literalDigits = literalDigitsInPattern(pattern)
    const isBarePrefix =
      raw.trim() === prefix || (literalDigits !== '' && rawDigits === literalDigits)
    return isBarePrefix ? prefix : ''
  }

  let digitIndex = 0
  let result = ''

  for (const char of pattern) {
    if (char === '#') {
      if (digitIndex >= digits.length) break
      result += digits[digitIndex++]
    } else {
      result += char
    }
  }

  return result
}

export function isPhoneComplete(value: string, pattern: string): boolean {
  return phoneDigits(value, pattern).length === slotCountInPattern(pattern)
}

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  /** Mask where `#` is a digit slot. Defaults to US `+1 (###) ###-####`. */
  pattern?: string
  label?: React.ReactNode
  disabled?: boolean
  className?: string
  inputClassName?: string
  id?: string
  placeholder?: string
  /** When true (default), marks the field invalid once blurred if incomplete. */
  validate?: boolean
}

function PhoneInput({
  value,
  onChange,
  pattern = '+1 (###) ###-####',
  label,
  disabled = false,
  className,
  inputClassName,
  id,
  placeholder,
  validate = true,
}: PhoneInputProps) {
  const inputId = React.useId()
  const resolvedId = id ?? inputId
  const [touched, setTouched] = React.useState(false)
  const prefix = phoneCountryPrefix(pattern)

  function handleChange(raw: string) {
    onChange(formatPhoneMask(raw, pattern))
  }

  function handleFocus() {
    // Seed the country code so typing continues after +1 (US) / +61 (AU), etc.
    if (!value.trim() && prefix) {
      onChange(prefix)
    }
  }

  function handleBlur() {
    setTouched(true)
    // Prefix-only counts as empty for the form value.
    if (value.trim() === prefix) {
      onChange('')
    }
  }

  const hasNationalDigits = phoneDigits(value, pattern).length > 0
  const invalid = validate && touched && hasNationalDigits && !isPhoneComplete(value, pattern)

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
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={invalid || undefined}
        className={inputClassName}
      />
    </div>
  )
}

export { PhoneInput }
export type { PhoneInputProps }
