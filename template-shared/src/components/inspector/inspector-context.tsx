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

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(false)
  const [hovered, setHovered] = React.useState<Element | null>(null)
  const [pinned, setPinned] = React.useState<Element | null>(null)

  const toggle = React.useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
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
