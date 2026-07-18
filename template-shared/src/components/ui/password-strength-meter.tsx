'use client'

import { cn } from '@/lib/utils'
import { getPasswordRequirementErrors } from '@/components/auth/password-policy'

const REQUIREMENT_COUNT = 4

type StrengthLevel = 'empty' | 'weak' | 'fair' | 'strong'

function scorePassword(password: string): { met: number; level: StrengthLevel; label: string } {
  if (!password) return { met: 0, level: 'empty', label: '' }

  const errors = getPasswordRequirementErrors(password)
  const met = Math.max(0, REQUIREMENT_COUNT - errors.length)

  if (met <= 1) return { met, level: 'weak', label: 'Weak' }
  if (met <= 3) return { met, level: 'fair', label: 'Fair' }
  return { met, level: 'strong', label: 'Strong' }
}

/** Maps strength to how many of the 3 visual bars are filled. */
function filledBars(level: StrengthLevel): number {
  if (level === 'empty') return 0
  if (level === 'weak') return 1
  if (level === 'fair') return 2
  return 3
}

const BAR_COLORS: Record<StrengthLevel, string> = {
  empty: 'bg-muted',
  weak: 'bg-destructive',
  fair: 'bg-warning-500',
  strong: 'bg-success-500',
}

type PasswordStrengthMeterProps = {
  password: string
  className?: string
}

function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { level, label } = scorePassword(password)
  const filled = filledBars(level)

  return (
    <div data-slot="password-strength-meter" data-level={level} className={cn('space-y-1.5', className)}>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            data-slot="password-strength-bar"
            data-filled={i < filled ? '' : undefined}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < filled ? BAR_COLORS[level] : 'bg-muted'
            )}
          />
        ))}
      </div>
      {label ? (
        <p
          data-slot="password-strength-label"
          className={cn(
            'text-xs font-medium',
            level === 'weak' && 'text-destructive',
            level === 'fair' && 'text-warning-600 dark:text-warning-400',
            level === 'strong' && 'text-success-600 dark:text-success-400'
          )}
        >
          {label}
        </p>
      ) : null}
      <span className="sr-only">
        {label ? `Password strength: ${label}` : 'Enter a password to see strength'}
      </span>
    </div>
  )
}

export { PasswordStrengthMeter, scorePassword }
export type { PasswordStrengthMeterProps, StrengthLevel }
