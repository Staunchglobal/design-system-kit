'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function ChatShell({
  className,
  sidebar,
  children,
  showChat = false,
}: {
  className?: string
  sidebar: React.ReactNode
  children: React.ReactNode
  /** When true on mobile, hide the contacts list and show the thread. */
  showChat?: boolean
}) {
  return (
    <div
      data-chat-shell
      className={cn(
        // Cap to the viewport so min-content never pushes the composer off-screen
        // or breaks the message scroller's flex height chain on small screens.
        'bg-background flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border lg:flex-row',
        className
      )}
    >
      <aside
        className={cn(
          'bg-card min-h-0 w-full flex-col border-r lg:max-w-[330px] lg:w-[330px] lg:shrink-0',
          showChat ? 'hidden lg:flex' : 'flex h-full min-h-0 flex-1'
        )}
      >
        {sidebar}
      </aside>
      <main
        className={cn(
          'min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
          showChat ? 'flex h-full' : 'hidden lg:flex'
        )}
      >
        {children}
      </main>
    </div>
  )
}
