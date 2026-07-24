'use client'

import * as React from 'react'

export function useElementTracking(target: Element | null): DOMRect | null {
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    if (!target) return

    const bump = () => setTick((t) => t + 1)

    const resizeObserver = new ResizeObserver(bump)
    resizeObserver.observe(target)

    const mutationObserver = new MutationObserver(bump)
    mutationObserver.observe(target, { attributes: true, attributeFilter: ['class', 'style'] })

    window.addEventListener('scroll', bump, { capture: true, passive: true })
    window.addEventListener('resize', bump, { passive: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('scroll', bump, { capture: true })
      window.removeEventListener('resize', bump)
    }
  }, [target])

  return React.useMemo(() => {
    if (!target || !target.isConnected) return null
    return target.getBoundingClientRect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, tick])
}
