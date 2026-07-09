'use client'

import * as React from 'react'
import { findInspectableTarget, isInsideInspectorUi } from './find-target'

type InspectorContextValue = {
  enabled: boolean
  toggle: () => void
  hovered: Element | null
  pinned: Element | null
  pin: (el: Element | null) => void
}

const InspectorContext = React.createContext<InspectorContextValue | null>(null)

/**
 * Listens at the `document` level (not a scoped subtree) so hover/click reach Radix portal
 * content (Dialog/Popover/Tooltip/DropdownMenu/Sheet/HoverCard/ContextMenu/Menubar/Command all
 * render into `document.body`, outside their trigger's own subtree, but still under `document`).
 */
export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(false)
  const [hovered, setHovered] = React.useState<Element | null>(null)
  const [pinned, setPinned] = React.useState<Element | null>(null)

  const toggle = React.useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      // Hover highlighting/click-hijacking should stop immediately, but a pinned panel stays
      // open across toggling off — that's what lets you turn click-hijacking off to actually use
      // a pinned Dialog/Popover normally while still comparing its values in the open panel.
      if (!next) setHovered(null)
      return next
    })
  }, [])

  const pin = React.useCallback((el: Element | null) => setPinned(el), [])

  React.useEffect(() => {
    if (!enabled) return

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof Element) || isInsideInspectorUi(target)) {
        setHovered((prev) => (prev === null ? prev : null))
        return
      }
      const next = findInspectableTarget(target)
      setHovered((prev) => (prev === next ? prev : next))
    }

    // Capture phase, so this runs before the target's own click handler — otherwise clicking a
    // demo's trigger while inspecting would both pin it AND actually open the Dialog/Popover/etc.
    const handleClick = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof Element) || isInsideInspectorUi(target)) return
      e.preventDefault()
      e.stopPropagation()
      setPinned(findInspectableTarget(target))
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('click', handleClick, { capture: true })

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [enabled])

  const value = React.useMemo<InspectorContextValue>(
    () => ({ enabled, toggle, hovered, pinned, pin }),
    [enabled, toggle, hovered, pinned, pin]
  )

  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>
}

export function useInspector(): InspectorContextValue {
  const ctx = React.useContext(InspectorContext)
  if (!ctx) throw new Error('useInspector must be used within InspectorProvider')
  return ctx
}
