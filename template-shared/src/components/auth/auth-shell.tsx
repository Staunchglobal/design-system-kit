'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export type AuthShellProps = {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  /** Optional control above the title (e.g. back link). */
  header?: React.ReactNode
  footer?: React.ReactNode
  logo?: React.ReactNode
  className?: string
}

export function AuthShell({
  title,
  description,
  children,
  header,
  footer,
  logo,
  className,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 p-4 sm:p-6',
        className
      )}
    >
      <div className="w-full max-w-[445px]">
        {logo ? <div className="mb-6 flex justify-center">{logo}</div> : null}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
          {header ? <div className="mb-4">{header}</div> : null}
          <div className="mb-5 flex flex-col gap-1.5">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <div className="text-muted-foreground text-sm leading-relaxed">{description}</div>
            ) : null}
          </div>
          {children}
          {footer ? (
            <div className="text-muted-foreground mt-6 flex flex-col items-stretch gap-2 border-t border-slate-100 pt-4 text-sm">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
