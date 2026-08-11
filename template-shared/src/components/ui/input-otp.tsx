'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/icons/icon'

type InputOTPContextValue = {
  chars: string[]
  maxLength: number
  disabled: boolean
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
  inputsRef: React.MutableRefObject<Array<HTMLInputElement | null>>
  focusSlot: (index: number) => void
  handleChange: (index: number, raw: string) => void
  handleKeyDown: (index: number, event: React.KeyboardEvent<HTMLInputElement>) => void
  handlePaste: (index: number, event: React.ClipboardEvent<HTMLInputElement>) => void
}

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null)

function useInputOTPContext(component: string): InputOTPContextValue {
  const ctx = React.useContext(InputOTPContext)
  if (!ctx) {
    throw new Error(`\`${component}\` must be used within \`InputOTP\``)
  }
  return ctx
}

function toChars(value: string, length: number): string[] {
  return Array.from({ length }, (_, i) => value[i] ?? '')
}

type InputOTPProps = {
  maxLength?: number
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  className?: string
  containerClassName?: string
  children?: React.ReactNode
  'aria-label'?: string
}

/**
 * Compound OTP input with a real `<input>` per slot so users can click a digit,
 * replace it, or backspace a single cell without clearing the whole value.
 */
function InputOTP({
  maxLength = 6,
  value,
  defaultValue,
  onChange,
  onComplete,
  disabled = false,
  className,
  containerClassName,
  children,
  'aria-label': ariaLabel = 'One-time password',
}: InputOTPProps) {
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    typeof defaultValue === 'string' ? defaultValue : ''
  )
  const resolvedValue = isControlled
    ? typeof value === 'string'
      ? value
      : String(value ?? '')
    : uncontrolledValue

  // Per-slot state: clearing a middle digit must not shift later digits left.
  const [chars, setChars] = React.useState<string[]>(() => toChars(resolvedValue, maxLength))
  const [prevExternal, setPrevExternal] = React.useState({ value: resolvedValue, maxLength })
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([])
  // join('') collapses empty middle slots ("12"+" "+ "456" → "12456"). Remember
  // the last value we emitted so echoing it back doesn't rebuild & shift chars.
  const lastCommittedRef = React.useRef(resolvedValue)

  if (resolvedValue !== prevExternal.value || maxLength !== prevExternal.maxLength) {
    setPrevExternal({ value: resolvedValue, maxLength })
    if (resolvedValue !== lastCommittedRef.current) {
      setChars(toChars(resolvedValue, maxLength))
      lastCommittedRef.current = resolvedValue
    }
  }

  function commit(next: string[]) {
    setChars(next)
    const joined = next.join('')
    lastCommittedRef.current = joined
    if (!isControlled) setUncontrolledValue(joined)
    onChange?.(joined)
    if (joined.length === maxLength && next.every(Boolean)) {
      onComplete?.(joined)
    }
  }

  function focusSlot(index: number) {
    const clamped = Math.min(Math.max(index, 0), maxLength - 1)
    const input = inputsRef.current[clamped]
    input?.focus()
    input?.select()
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
    digits.split('').forEach((digit, offset) => {
      if (index + offset < maxLength) next[index + offset] = digit
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
      if (index + offset < maxLength) next[index + offset] = digit
    })
    commit(next)
    focusSlot(index + digits.length)
  }

  const ctx: InputOTPContextValue = {
    chars,
    maxLength,
    disabled,
    activeIndex,
    setActiveIndex,
    inputsRef,
    focusSlot,
    handleChange,
    handleKeyDown,
    handlePaste,
  }

  return (
    <InputOTPContext.Provider value={ctx}>
      <div
        data-slot="input-otp"
        role="group"
        aria-label={ariaLabel}
        className={cn(
          'cn-input-otp flex items-center has-disabled:opacity-50',
          containerClassName,
          className
        )}
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </InputOTPContext.Provider>
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        'has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 flex items-center rounded-lg has-aria-invalid:ring-3',
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  onFocus,
  onBlur,
  ...props
}: Omit<
  React.ComponentProps<'input'>,
  'value' | 'defaultValue' | 'maxLength' | 'type' | 'inputMode' | 'disabled'
> & {
  index: number
}) {
  const {
    chars,
    disabled,
    activeIndex,
    setActiveIndex,
    inputsRef,
    handleChange,
    handleKeyDown,
    handlePaste,
  } = useInputOTPContext('InputOTPSlot')

  const isActive = activeIndex === index

  return (
    <input
      {...props}
      ref={(el) => {
        inputsRef.current[index] = el
      }}
      data-slot="input-otp-slot"
      data-active={isActive}
      type="text"
      inputMode="numeric"
      autoComplete={index === 0 ? 'one-time-code' : 'off'}
      disabled={disabled}
      aria-label={props['aria-label'] ?? `Digit ${index + 1}`}
      maxLength={1}
      value={chars[index] ?? ''}
      onChange={(e) => handleChange(index, e.target.value)}
      onKeyDown={(e) => handleKeyDown(index, e)}
      onPaste={(e) => handlePaste(index, e)}
      onFocus={(e) => {
        setActiveIndex(index)
        e.currentTarget.select()
        onFocus?.(e)
      }}
      onBlur={(e) => {
        setActiveIndex(null)
        onBlur?.(e)
      }}
      className={cn(
        'border-input aria-invalid:border-destructive data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40 relative flex size-8 items-center justify-center border-y border-r text-center text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:ring-3 disabled:cursor-not-allowed',
        className
      )}
    />
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <AppIcon name="input-otp.minus" />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
