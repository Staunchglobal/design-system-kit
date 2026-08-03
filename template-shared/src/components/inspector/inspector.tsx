'use client'

import type { ReactNode } from 'react'
import { InspectorProvider } from './inspector-context'
import { InspectorToggle } from './inspector-toggle'
import { InspectorOverlay } from './inspector-overlay'
import { InspectorPanel } from './inspector-panel'

/**
 * Both Next's bundler (webpack/Turbopack) and Vite's (esbuild/rollup) statically replace the
 * literal expression `process.env.NODE_ENV` at build time — this is a universal bundler
 * convention (React itself relies on it for dev-warning DCE), so the check MUST reference that
 * exact member expression directly, not through a `globalThis`/indirection cast: bundlers
 * pattern-match the literal AST node, and any indirection defeats the static replacement,
 * silently making this always evaluate to false in the shipped bundle. The only real problem is
 * that Vite doesn't ship `@types/node`, so plain `process` fails to type-check there — solved with
 * a local ambient `declare const`, which only affects this file's type-checking, not runtime.
 */
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
