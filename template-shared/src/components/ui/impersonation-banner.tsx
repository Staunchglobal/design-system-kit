'use client'

import * as React from 'react'
import { AlertTriangle, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ImpersonationBannerProps = {
  message: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  /** Optional fully custom action; takes precedence over actionLabel/onAction. */
  action?: React.ReactNode
  onDismiss?: () => void
  className?: string
}

function ImpersonationBanner({
  message,
  actionLabel = 'Stop impersonating',
  onAction,
  action,
  onDismiss,
  className,
}: ImpersonationBannerProps) {
  return (
    <div
      data-slot="impersonation-banner"
      role="alert"
      aria-live="polite"
      className={cn(
        'sticky top-0 z-50 flex w-full items-center gap-2.5 border-b border-warning-300/40 bg-warning-50 px-4 py-2.5 text-sm text-warning-900 dark:border-warning-700/40 dark:bg-warning-950/60 dark:text-warning-200',
        className
      )}
    >
      <AlertTriangle
        aria-hidden="true"
        className="size-4 shrink-0 text-warning-600 dark:text-warning-400"
      />
      <span className="flex-1">{message}</span>
      {action ? (
        <span className="shrink-0">{action}</span>
      ) : onAction ? (
        <Button type="button" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {onDismiss ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          aria-label="Dismiss banner"
          className="ml-1 shrink-0 text-warning-700 hover:bg-warning-100 hover:text-warning-900 dark:text-warning-400 dark:hover:bg-warning-900/40 dark:hover:text-warning-200"
        >
          <X />
        </Button>
      ) : null}
    </div>
  )
}

export { ImpersonationBanner }
export type { ImpersonationBannerProps }
