'use client'

import type { ReactNode } from 'react'
import { InspectorProvider } from './inspector-context'
import { InspectorToggle } from './inspector-toggle'
import { InspectorOverlay } from './inspector-overlay'
import { InspectorPanel } from './inspector-panel'

declare const process: { env: { NODE_ENV?: string } }

function isProductionBuild(): boolean {
  if (process.env.NODE_ENV === 'production') return true
  return Boolean((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD)
}

export function Inspector({ children }: { children: ReactNode }) {
  if (isProductionBuild()) return <>{children}</>

  return (
    <InspectorProvider>
      {children}
      <InspectorToggle />
      <InspectorOverlay />
      <InspectorPanel />
    </InspectorProvider>
  )
}
