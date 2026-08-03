'use client'

import * as React from 'react'
import { icons, type LucideProps } from 'lucide-react'
import { useIconMap } from '@/components/icons/icon-context'
import type { IconKey } from '@/components/icons/icon-map'
import { cn } from '@/lib/utils'

type AppIconProps = LucideProps & {
  name: IconKey | string
  overrideMap?: Record<string, string>
}

export function AppIcon({ name, overrideMap, className, ...props }: AppIconProps) {
  const ctxMap = useIconMap()
  const lucideName = overrideMap?.[name] ?? ctxMap[name] ?? name
  const Comp = (icons as Record<string, React.ComponentType<LucideProps>>)[lucideName]

  if (!Comp) {
    return (
      <span
        className={cn('inline-flex size-4 items-center justify-center text-[10px]', className)}
        title={`Missing icon: ${lucideName}`}
      >
        ?
      </span>
    )
  }

  return <Comp className={cn(className)} {...props} />
}

export function resolveLucideIcon(lucideName: string): React.ComponentType<LucideProps> | null {
  return (icons as Record<string, React.ComponentType<LucideProps>>)[lucideName] ?? null
}

export const lucideIconNames = Object.keys(icons).sort()
