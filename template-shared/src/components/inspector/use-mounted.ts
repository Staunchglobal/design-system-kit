'use client'

import * as React from 'react'

/**
 * Guards portal-based rendering (createPortal(..., document.body)) until after hydration.
 * `typeof document === 'undefined'` alone isn't enough on Next.js: the server render sees no
 * `document` and renders null, but the client's *first* render pass — the one React hydrates
 * against — already has a real `document` and would render the actual portal content
 * immediately, mismatching what the server sent. Server and client must render identically
 * (null) on that first pass; the real content only mounts on a later, client-only render,
 * triggered by this effect (effects never run during SSR or the hydration pass itself).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  return mounted
}
