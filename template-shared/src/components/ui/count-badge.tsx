import { cn } from '@/lib/utils'

type CountBadgeProps = {
  count: number
  /** Items are capped at this value and shown as `{max}+`. Defaults to 99. */
  max?: number
  className?: string
}

function CountBadge({ count, max = 99, className }: CountBadgeProps) {
  const normalizedCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
  const normalizedMax = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99
  if (normalizedCount <= 0) return null

  const capped = normalizedCount > normalizedMax
  const displayed = capped ? `${normalizedMax}+` : String(normalizedCount)
  const ariaLabel = capped ? `${normalizedMax} or more` : String(normalizedCount)

  return (
    <span
      data-slot="count-badge"
      aria-label={ariaLabel}
      className={cn(
        'bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium leading-none tabular-nums',
        className
      )}
    >
      <span aria-hidden="true">{displayed}</span>
    </span>
  )
}

export { CountBadge }
export type { CountBadgeProps }
