'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useInspector } from './inspector-context'
import { useElementTracking } from './use-element-tracking'
import { useMounted } from './use-mounted'
import { readComputedStyle, describeTarget } from './style-reader'

function HighlightBox({ rect, colorClassName }: { rect: DOMRect; colorClassName: string }) {
  return (
    <div
      data-inspector-ui=""
      className={cn('pointer-events-none fixed z-[2147483000] rounded-[2px] border-2', colorClassName)}
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
    />
  )
}

function HoverTooltip({ rect, el }: { rect: DOMRect; el: Element }) {
  const snapshot = React.useMemo(() => readComputedStyle(el), [el])
  const meta = React.useMemo(() => describeTarget(el), [el])
  const top = Math.max(4, rect.top - 34)
  const maxLeft = (typeof window !== 'undefined' ? window.innerWidth : 0) - 220
  const left = Math.min(Math.max(4, rect.left), Math.max(4, maxLeft))

  return (
    <div
      data-inspector-ui=""
      className="pointer-events-none fixed z-[2147483000] rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
      style={{ top, left }}
    >
      <div className="font-mono">
        {meta.slot ?? meta.tag}
        {meta.variant ? ` · ${meta.variant}` : ''}
        {meta.size ? ` · ${meta.size}` : ''}
      </div>
      <div className="mt-0.5 flex items-center gap-2 text-neutral-300">
        <span>
          {snapshot.width} × {snapshot.height}
        </span>
        {snapshot.background && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block size-2.5 rounded-sm border border-white/30"
              style={{ background: snapshot.background.hex }}
            />
            {snapshot.background.hex}
          </span>
        )}
      </div>
    </div>
  )
}

export function InspectorOverlay() {
  const { enabled, hovered, pinned } = useInspector()
  const hoverRect = useElementTracking(hovered)
  const pinnedRect = useElementTracking(pinned)
  const mounted = useMounted()

  if (!mounted) return null

  return createPortal(
    <>
      {enabled && hovered && hoverRect && hovered !== pinned && (
        <>
          <HighlightBox rect={hoverRect} colorClassName="border-blue-500" />
          <HoverTooltip rect={hoverRect} el={hovered} />
        </>
      )}
      {pinned && pinnedRect && <HighlightBox rect={pinnedRect} colorClassName="border-primary" />}
    </>,
    document.body
  )
}
