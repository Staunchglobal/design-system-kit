'use client'

import * as React from 'react'

/**
 * Tracks a live element's bounding rect — re-measures on scroll/resize (catches viewport-driven
 * moves) and via ResizeObserver/MutationObserver on the element itself (catches content-driven
 * size changes, e.g. a live theme edit changing padding, with no scroll/resize event at all).
 * Returns null once the element is detached (e.g. a closed Dialog unmounted its content).
 *
 * The rect itself is computed with useMemo during render (a plain DOM read, safe any time) —
 * the effect below only subscribes to observers/listeners, which call setState from their own
 * callbacks (bumping `tick` to trigger a re-measure), never synchronously within the effect body.
 */
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
    // `tick` intentionally participates only to force a re-measure on observer/listener events —
    // it carries no data of its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, tick])
}
