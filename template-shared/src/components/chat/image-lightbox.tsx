'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ImageLightbox({
  urls,
  index,
  open,
  onOpenChange,
}: {
  urls: string[]
  index: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [i, setI] = React.useState(index)
  const [mounted, setMounted] = React.useState(false)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => setMounted(true), [])
  React.useEffect(() => setI(index), [index])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1))
      if (e.key === 'ArrowRight') setI((v) => Math.min(urls.length - 1, v + 1))
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange, urls.length])

  // Move focus into the dialog on open (so keyboard users land somewhere real instead of
  // a portaled node with no natural tab order), and restore it to whatever triggered the
  // lightbox (the thumbnail button) on close.
  React.useEffect(() => {
    if (!open) return
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    return () => {
      previouslyFocusedRef.current?.focus?.()
    }
  }, [open])

  if (!mounted || !open || !urls[i]) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={() => onOpenChange(false)}
    >
      <Button
        ref={closeButtonRef}
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={() => onOpenChange(false)}
      >
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </Button>
      <img
        src={urls[i]}
        alt=""
        className={cn(
          'relative z-0 max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-lg'
        )}
        onClick={(e) => e.stopPropagation()}
      />
      {urls.length > 1 ? (
        <div
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="secondary"
            disabled={i <= 0}
            onClick={() => setI((v) => Math.max(0, v - 1))}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={i >= urls.length - 1}
            onClick={() => setI((v) => Math.min(urls.length - 1, v + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>,
    document.body
  )
}
