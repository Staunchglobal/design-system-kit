import * as React from 'react'
import { CircleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

type ErrorStateProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  onRetry?: () => void
  retryLabel?: string
  icon?: React.ReactNode
  className?: string
}

function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error while loading data. Please try again later.',
  onRetry,
  retryLabel = 'Try again',
  icon,
  className,
}: ErrorStateProps) {
  return (
    <Empty data-slot="error-state" className={cn('border border-dashed', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
          {icon ?? <CircleAlert />}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}

export { ErrorState }
export type { ErrorStateProps }
