import * as React from 'react'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type StatCardTrend = {
  value: string
  direction: 'up' | 'down' | 'neutral'
}

type StatCardProps = {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  loading?: boolean
  trend?: StatCardTrend
  className?: string
}

const TREND_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: ArrowRight,
} as const

const TREND_CLASS = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
} as const

function StatCard({ label, value, icon, loading = false, trend, className }: StatCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null

  return (
    <Card data-slot="stat-card" size="sm" className={cn(className)}>
      <CardContent className="flex items-start gap-3">
        {icon ? (
          <div
            data-slot="stat-card-icon"
            className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4"
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <p data-slot="stat-card-label" className="text-muted-foreground text-xs font-medium">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p data-slot="stat-card-value" className="font-heading text-2xl leading-none font-semibold tracking-tight">
              {value}
            </p>
          )}
          {trend && !loading && TrendIcon ? (
            <p
              data-slot="stat-card-trend"
              data-direction={trend.direction}
              className={cn('flex items-center gap-1 text-xs font-medium', TREND_CLASS[trend.direction])}
            >
              <TrendIcon className="size-3.5" />
              <span>{trend.value}</span>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export { StatCard }
export type { StatCardProps, StatCardTrend }
