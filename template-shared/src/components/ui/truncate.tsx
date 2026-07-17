'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/** Heuristic for whether a multi-line clamp should offer a see-more toggle. */
export function shouldOfferExpansion(
  text: string,
  maxLines: number,
  minCharsForToggle: number
): boolean {
  if (!text) return false
  if (text.length >= minCharsForToggle) return true
  // Rough line estimate when char count is below the hard floor.
  const approxLines = text.split(/\n/).length + Math.floor(text.length / 72)
  return approxLines > maxLines
}

type TruncateProps = {
  text: string
  mode?: 'tooltip' | 'expand'
  maxLines?: number
  minCharsForToggle?: number
  className?: string
}

function Truncate({
  text,
  mode = 'tooltip',
  maxLines = 4,
  minCharsForToggle = 180,
  className,
}: TruncateProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [overflows, setOverflows] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  React.useLayoutEffect(() => {
    if (mode !== 'tooltip') return
    const el = ref.current
    if (!el) return

    const check = () => {
      setOverflows(el.scrollWidth > el.clientWidth)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text, mode])

  if (mode === 'expand') {
    const offer = shouldOfferExpansion(text, maxLines, minCharsForToggle)
    return (
      <div data-slot="truncate" data-mode="expand" className={cn('space-y-1', className)}>
        <p
          className={cn(
            'text-sm whitespace-pre-wrap',
            !expanded && offer && 'overflow-hidden'
          )}
          style={
            !expanded && offer
              ? {
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: maxLines,
                }
              : undefined
          }
        >
          {text}
        </p>
        {offer ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'See less' : 'See more'}
          </Button>
        ) : null}
      </div>
    )
  }

  const span = (
    <span
      ref={ref}
      data-slot="truncate"
      data-mode="tooltip"
      // Only focusable when there's actually a tooltip to reveal — otherwise this
      // would add a dead tab stop for text that isn't truncated.
      tabIndex={overflows ? 0 : undefined}
      className={cn(
        'block truncate text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-xs',
        className
      )}
    >
      {text}
    </span>
  )

  if (!overflows) return span

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{span}</TooltipTrigger>
        <TooltipContent className="max-w-xs text-balance">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Truncate }
export type { TruncateProps }
