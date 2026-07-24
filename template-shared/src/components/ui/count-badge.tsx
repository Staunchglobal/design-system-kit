import { cn } from '@/lib/utils'

type CountBadgeProps = {
  count: number
  /** Items are capped at this value and shown as `{max}+`. Defaults to 99. */
  max?: number
  /** `overlay` = compact pill for icon buttons (position as a sibling, not a child). */
  size?: 'default' | 'overlay'
  className?: string
}

function CountBadge({ count, max = 99, size = 'default', className }: CountBadgeProps) {
  const normalizedCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
  const normalizedMax = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99
  if (normalizedCount <= 0) return null

  const capped = normalizedCount > normalizedMax
  const displayed = capped ? `${normalizedMax}+` : String(normalizedCount)
  const ariaLabel = capped ? `${normalizedMax} or more` : String(normalizedCount)

  return (
    <span
      data-slot="count-badge"
      data-size={size}
      aria-label={ariaLabel}
      className={cn('tabular-nums', className)}
    >
      <span aria-hidden="true">{displayed}</span>
    </span>
  )
}

export { CountBadge }
export type { CountBadgeProps }
