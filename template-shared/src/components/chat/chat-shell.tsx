'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function ChatShell({
  className,
  sidebar,
  children,
}: {
  className?: string
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'bg-background flex h-[calc(100vh-2rem)] min-h-[480px] w-full overflow-hidden rounded-xl border',
        className
      )}
    >
      <aside className="bg-card flex w-full max-w-[360px] shrink-0 flex-col border-r max-md:max-w-full md:w-[360px]">
        {sidebar}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
