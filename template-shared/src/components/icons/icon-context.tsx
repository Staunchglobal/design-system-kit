'use client'

import * as React from 'react'
import { iconMap as baseIconMap } from '@/components/icons/icon-map'

const IconMapContext = React.createContext<Record<string, string> | null>(null)

export function IconMapProvider({
  value,
  children,
}: {
  value?: Record<string, string>
  children: React.ReactNode
}) {
  return <IconMapContext.Provider value={value ?? null}>{children}</IconMapContext.Provider>
}

export function useIconMap(): Record<string, string> {
  const override = React.useContext(IconMapContext)
  return override ?? baseIconMap
}
