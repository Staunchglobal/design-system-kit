'use client'

import { createPortal } from 'react-dom'
import { Crosshair } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInspector } from './inspector-context'
import { useMounted } from './use-mounted'

export function InspectorToggle() {
  const { enabled, toggle } = useInspector()
  const mounted = useMounted()

  if (!mounted) return null

  // Portalled to document.body, same as the overlay/panel — an ancestor with its own `position:
  // relative/fixed` + a lower z-index creates a local stacking context that caps this button's
  // effective z-index no matter how high the number is, regardless of DOM nesting depth. Any
  // component rendering `<Inspector>` somewhere deep in a normal layout tree (as every demo page
  // here does) would otherwise risk the toggle losing a stacking fight against a Radix Dialog/
  // Popover/etc.'s own body-level portal, since those aren't subject to the same local context.
  return createPortal(
    <button
      type="button"
      data-inspector-ui=""
      onClick={toggle}
      aria-pressed={enabled}
      title={enabled ? 'Inspector on — click to turn off' : 'Inspect elements'}
      className={cn(
        // One above the overlay/panel's z-index (2147483000) — the panel spans the full right
        // edge of the viewport (`inset-y-0 right-0`), which would otherwise cover this same
        // bottom-right corner and make the toggle unreachable while a pinned panel is open.
        'fixed right-5 bottom-5 z-[2147483001] flex size-11 items-center justify-center rounded-full border shadow-lg transition-colors',
        enabled
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-foreground border-border hover:bg-muted'
      )}
    >
      <Crosshair className="size-5" />
    </button>,
    document.body
  )
}
