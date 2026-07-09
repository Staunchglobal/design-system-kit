import * as React from 'react'

import { cn } from '@/lib/utils'

export function ComponentSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-8 border-b py-12 first:pt-0 last:border-b-0">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      <div className="space-y-8">{children}</div>
    </section>
  )
}

export function Example({
  title,
  description,
  children,
  className,
  contentClassName,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description ? <p className="text-muted-foreground text-xs">{description}</p> : null}
      </div>
      <div
        className={cn(
          'bg-card flex flex-wrap items-center gap-4 rounded-lg border p-6',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function ExampleGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('grid gap-6 md:grid-cols-2', className)}>{children}</div>
}
