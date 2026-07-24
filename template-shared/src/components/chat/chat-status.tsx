'use client'

import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export { errorMessage } from '@/components/chat/chat-utils'

export type ChatErrorBannerProps = {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

/** Compact banner with optional retry — for dialogs / inline panels. */
export function ChatErrorBanner({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ChatErrorBannerProps): React.JSX.Element {
  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{message}</p>
        {onRetry ? (
          <Button type="button" size="sm" variant="outline" onClick={onRetry} className="w-fit">
            Try again
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}

export type ChatErrorPanelProps = {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

/** Full-panel error for list / thread empty regions. */
export function ChatErrorPanel({
  title,
  message,
  onRetry,
  className,
}: ChatErrorPanelProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <ErrorState title={title} description={message} onRetry={onRetry} className="w-full max-w-sm" />
    </div>
  )
}

export function ChatListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-2" aria-busy="true" aria-label="Loading conversations">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg p-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChatMessagesSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="flex flex-col gap-4 p-4"
      aria-busy="true"
      aria-label="Loading messages"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn('flex gap-2', i % 2 === 0 ? 'justify-start' : 'justify-end')}
        >
          {i % 2 === 0 ? <Skeleton className="size-8 shrink-0 rounded-full" /> : null}
          <Skeleton className={cn('h-16 rounded-2xl', i % 2 === 0 ? 'w-2/3' : 'w-1/2')} />
        </div>
      ))}
    </div>
  )
}

export function ChatBusyLabel({
  busy,
  idle,
  busyLabel,
}: {
  busy?: boolean
  idle: React.ReactNode
  busyLabel: React.ReactNode
}) {
  if (!busy) return <>{idle}</>
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner className="size-3.5" />
      {busyLabel}
    </span>
  )
}
