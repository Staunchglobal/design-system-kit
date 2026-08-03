'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type ChatEmptyStateProps = {
  icon: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  size?: 'sm' | 'default'
  className?: string
}

/**
 * Empty state for the chat surfaces (thread pane, sidebar list, dialogs).
 * Deliberately avoids the themed `empty-*` slots, which force h6-sized titles
 * that overwhelm the sidebar and dialog.
 */
export function ChatEmptyState({
  icon,
  title,
  description,
  action,
  size = 'default',
  className,
}: ChatEmptyStateProps): React.JSX.Element {
  const compact = size === 'sm'

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-10',
        className
      )}
    >
      <div
        className={cn(
          'text-muted-foreground bg-muted/50 flex shrink-0 items-center justify-center rounded-full',
          compact ? 'size-10 [&_svg]:size-4.5' : 'size-14 [&_svg]:size-6'
        )}
      >
        {icon}
      </div>
      <div className="flex max-w-[16rem] flex-col gap-1">
        <p className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>{title}</p>
        {description ? (
          <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
