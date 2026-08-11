'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export type OtpFieldProps = {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  invalid?: boolean
  className?: string
  'aria-label'?: string
}

function toChars(value: string, length: number): string[] {
  return Array.from({ length }, (_, i) => value[i] ?? '')
}

/**
 * Six joined single-character inputs.
 *
 * Same per-slot input pattern as `InputOTP` in `components/ui/input-otp.tsx` —
 * a real input per cell so clicking focuses that slot and Backspace only clears
 * the digit under the caret.
 */
export function OtpField({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  invalid = false,
  className,
  'aria-label': ariaLabel = 'Verification code',
}: OtpFieldProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([])
  // Per-slot state rather than slicing the joined value: clearing a middle slot
  // shortens that string, and re-deriving from it would shift later digits left.
  const [chars, setChars] = React.useState<string[]>(() => toChars(value, length))
  const [prevExternal, setPrevExternal] = React.useState({ value, length })
  const lastCommittedRef = React.useRef(value)
  // Sync when the parent resets/changes the controlled value (not our own echo).
  if (value !== prevExternal.value || length !== prevExternal.length) {
    setPrevExternal({ value, length })
    if (value !== lastCommittedRef.current) {
      setChars(toChars(value, length))
      lastCommittedRef.current = value
    }
  }

  function focusSlot(index: number) {
    const input = inputsRef.current[Math.min(Math.max(index, 0), length - 1)]
    input?.focus()
    input?.select()
  }

  function commit(next: string[]) {
    setChars(next)
    const joined = next.join('')
    lastCommittedRef.current = joined
    onChange(joined)
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')

    // Some mobile keyboards clear a slot without firing a Backspace keydown.
    if (!digits) {
      if (chars[index]) {
        const cleared = [...chars]
        cleared[index] = ''
        commit(cleared)
      }
      return
    }

    const next = [...chars]
    // Typing into a filled slot, or pasting several digits at once, fills forward.
    digits.split('').forEach((digit, offset) => {
      if (index + offset < length) next[index + offset] = digit
    })
    commit(next)
    focusSlot(index + digits.length)
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const next = [...chars]
      if (next[index]) {
        next[index] = ''
        commit(next)
        return
      }
      if (index > 0) {
        next[index - 1] = ''
        commit(next)
        focusSlot(index - 1)
      }
      return
    }

    if (event.key === 'Delete') {
      event.preventDefault()
      const next = [...chars]
      next[index] = ''
      commit(next)
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusSlot(index - 1)
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusSlot(index + 1)
    }
  }

  function handlePaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!digits) return
    event.preventDefault()

    const next = [...chars]
    digits.split('').forEach((digit, offset) => {
      if (index + offset < length) next[index + offset] = digit
    })
    commit(next)
    focusSlot(index + digits.length)
  }

  return (
    <div role="group" aria-label={ariaLabel} className={cn('flex w-full items-stretch', className)}>
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          aria-invalid={invalid}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          value={char}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            'border-input bg-background text-foreground h-13 w-full min-w-0 flex-1 border-y border-r text-center text-base outline-none transition-colors',
            'first:rounded-l-xl first:border-l last:rounded-r-xl',
            'focus:border-ring focus:ring-ring/50 focus:relative focus:z-10 focus:ring-3',
            'disabled:pointer-events-none disabled:opacity-50',
            invalid && 'border-destructive focus:border-destructive focus:ring-destructive/20'
          )}
        />
      ))}
    </div>
  )
}
