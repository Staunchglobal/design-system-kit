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

  return createPortal(
    <button
      type="button"
      data-inspector-ui=""
      onClick={toggle}
      aria-pressed={enabled}
      title={enabled ? 'Inspector on — click to turn off' : 'Inspect elements'}
      className={cn(
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
