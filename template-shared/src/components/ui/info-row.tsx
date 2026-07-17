import * as React from 'react'

import { cn } from '@/lib/utils'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type InfoRowProps = {
  label: React.ReactNode
  value?: React.ReactNode
  fallback?: React.ReactNode
  orientation?: 'horizontal' | 'stacked'
  className?: string
}

function InfoRow({
  label,
  value,
  fallback = '—',
  orientation = 'horizontal',
  className,
}: InfoRowProps) {
  const display = value == null || value === '' ? fallback : value

  return (
    <div
      data-slot="info-row"
      data-orientation={orientation}
      className={cn(
        'gap-1 text-sm',
        orientation === 'horizontal'
          ? 'flex items-baseline justify-between gap-4'
          : 'flex flex-col',
        className
      )}
    >
      <div data-slot="info-row-label" className="text-muted-foreground shrink-0 font-medium">
        {label}
      </div>
      <div
        data-slot="info-row-value"
        className={cn(
          'text-foreground min-w-0 font-normal',
          orientation === 'horizontal' ? 'text-right' : 'text-left'
        )}
      >
        {display}
      </div>
    </div>
  )
}

type InfoListProps = {
  columns?: 1 | 2 | 3
  className?: string
  children: React.ReactNode
}

function InfoList({ columns = 1, className, children }: InfoListProps) {
  return (
    <div
      data-slot="info-list"
      data-columns={columns}
      className={cn(
        'grid gap-x-6 gap-y-3',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  )
}

type InfoCardProps = {
  title?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
  children: React.ReactNode
}

function InfoCard({ title, icon, action, columns = 1, className, children }: InfoCardProps) {
  return (
    <Card data-slot="info-card" className={cn(className)}>
      {(title || icon || action) && (
        <CardHeader className={cn(icon && 'flex flex-row items-start gap-2')}>
          {icon ? (
            <div
              data-slot="info-card-icon"
              className="bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4"
            >
              {icon}
            </div>
          ) : null}
          {title ? <CardTitle>{title}</CardTitle> : null}
          {action ? <CardAction>{action}</CardAction> : null}
        </CardHeader>
      )}
      <CardContent>
        <InfoList columns={columns}>{children}</InfoList>
      </CardContent>
    </Card>
  )
}

export { InfoRow, InfoList, InfoCard }
export type { InfoRowProps, InfoListProps, InfoCardProps }
