'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  inputClassName?: string
}

/**
 * Password field with show/hide toggle.
 *
 * Uses inline paddingRight (not Tailwind `pr-*`) because Input ships `px-2.5`, and
 * tailwind-merge leaves both `px-*` and `pr-*` in the class list — stylesheet order
 * then often lets `px` win and text runs under the eye icon.
 */
export function PasswordInput({
  className,
  inputClassName,
  disabled,
  style,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className={cn('relative', className)}>
      <Input
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={inputClassName}
        style={{ ...style, paddingRight: '2.5rem' }}
        {...props}
      />
      <button
        type="button"
        disabled={disabled}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-center rounded-r-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
      </button>
    </div>
  )
}
