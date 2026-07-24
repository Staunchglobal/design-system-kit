'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type MediaType = 'image' | 'video' | 'embed'

type MediaItem = {
  id?: string
  type: MediaType
  src: string
  alt?: string
  thumbnail?: string
  thumbnailSrc?: string
  title?: string
}

/**
 * Converts a YouTube or Vimeo watch URL to its embeddable form.
 * Returns `null` when the URL is unrecognised or malformed.
 * Already-embedded URLs are returned unchanged.
 */
function parseEmbedUrl(url: string): string | null {
  if (!url) return null

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
      // scrollIntoView is unavailable in some test environments
  }

  const { hostname, pathname, searchParams } = parsed

  if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
    const v = searchParams.get('v')
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`

    const embedMatch = pathname.match(/^\/embed\/([^/?#]+)/)
    if (embedMatch) {
      return hostname.includes('nocookie')
        ? url
        : `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`
    }
  }

  if (hostname === 'www.youtube-nocookie.com' || hostname === 'youtube-nocookie.com') {
    return url
  }

  if (hostname === 'youtu.be') {
    const vid = pathname.slice(1).split('/')[0]
    if (vid) return `https://www.youtube-nocookie.com/embed/${vid}`
  }

  if (hostname === 'vimeo.com' || hostname === 'www.vimeo.com') {
    const videoMatch = pathname.match(/^\/(?:video\/)?(\d+)/)
    if (videoMatch) return `https://player.vimeo.com/video/${videoMatch[1]}`
  }

  if (hostname === 'player.vimeo.com') return url

  return null
}

type MediaGalleryProps = {
  items: MediaItem[]
  activeId?: string
  onActiveChange?: (id: string) => void
  className?: string
  viewerClassName?: string
  thumbnailStripClassName?: string
}

function mediaItemId(item: MediaItem, index: number): string {
  return item.id ?? `${index}:${item.src}`
}

function MediaGallery({
  items,
  activeId: controlledActiveId,
  onActiveChange,
  className,
  viewerClassName,
  thumbnailStripClassName,
}: MediaGalleryProps) {
  const [internalActiveId, setInternalActiveId] = React.useState(
    items[0] ? mediaItemId(items[0], 0) : ''
  )
  const isControlled = controlledActiveId !== undefined
  const activeId = isControlled ? controlledActiveId : internalActiveId

  const activeThumbnailRef = React.useRef<HTMLButtonElement>(null)

  const activeIndex = React.useMemo(
    () => items.findIndex((item, index) => mediaItemId(item, index) === activeId),
    [items, activeId]
  )
  const safeIndex = activeIndex === -1 ? 0 : activeIndex
  const activeItem = items[safeIndex]

  const setActive = React.useCallback(
    (id: string) => {
      if (!isControlled) setInternalActiveId(id)
      onActiveChange?.(id)
    },
    [isControlled, onActiveChange]
  )

  const goPrev = React.useCallback(() => {
    if (items.length === 0) return
    const index = (safeIndex - 1 + items.length) % items.length
    setActive(mediaItemId(items[index], index))
  }, [items, safeIndex, setActive])

  const goNext = React.useCallback(() => {
    if (items.length === 0) return
    const index = (safeIndex + 1) % items.length
    setActive(mediaItemId(items[index], index))
  }, [items, safeIndex, setActive])

  React.useEffect(() => {
    const el = activeThumbnailRef.current
    if (!el) return
    try {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
    } catch {
    }
  }, [activeId])

  if (!activeItem) {
    return (
      <div
        data-slot="media-gallery"
        aria-label="Media gallery"
        className={cn('flex items-center justify-center p-8', className)}
      >
        <span className="text-muted-foreground text-sm">No media</span>
      </div>
    )
  }

  return (
    <div
      data-slot="media-gallery"
      aria-label="Media gallery"
      className={cn('flex flex-col gap-2', className)}
    >
      <div
        data-slot="media-gallery-viewer"
        className={cn(
          'bg-muted relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg',
          viewerClassName
        )}
      >
        <MediaViewer item={activeItem} />
        {items.length > 1 ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous"
              onClick={goPrev}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 hover:text-white"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next"
              onClick={goNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 hover:text-white"
            >
              <ChevronRight />
            </Button>
          </>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div
          data-slot="media-gallery-thumbnails"
          role="tablist"
          aria-label="Media thumbnails"
          className={cn('flex gap-2 overflow-x-auto pb-1', thumbnailStripClassName)}
        >
          {items.map((item, index) => {
            const itemId = mediaItemId(item, index)
            return (
            <button
              key={itemId}
              ref={itemId === activeId ? activeThumbnailRef : undefined}
              type="button"
              role="tab"
              aria-selected={itemId === activeId}
              aria-label={item.title ?? item.alt ?? `Media ${index + 1}`}
              data-slot="media-gallery-thumbnail"
              onClick={() => setActive(itemId)}
              className={cn(
                'bg-muted relative aspect-video h-16 w-auto shrink-0 overflow-hidden rounded-md border-2 transition-all',
                itemId === activeId
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <MediaThumbnail item={item} />
            </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function MediaViewer({ item }: { item: MediaItem }) {
  if (item.type === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.src}
        alt={item.alt ?? item.title ?? ''}
        className="size-full object-contain"
        draggable={false}
      />
    )
  }

  if (item.type === 'video') {
    return (
      <video
        src={item.src}
        controls
        className="size-full"
        aria-label={item.title ?? item.alt ?? 'Video'}
      />
    )
  }

  if (item.type === 'embed') {
    const src = parseEmbedUrl(item.src)
    if (!src) {
      return <span className="text-muted-foreground text-sm">Unsupported embed URL</span>
    }
    return (
      <iframe
        src={src}
        title={item.title ?? item.alt ?? 'Embedded media'}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    )
  }

  return null
}

function MediaThumbnail({ item }: { item: MediaItem }) {
  const src = item.thumbnail ?? item.thumbnailSrc ?? (item.type === 'image' ? item.src : undefined)

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={item.alt ?? item.title ?? ''}
        className="size-full object-cover"
        draggable={false}
      />
    )
  }

  return (
    <span className="text-muted-foreground flex size-full items-center justify-center">
      <Play className="size-5" aria-hidden="true" />
    </span>
  )
}

export { MediaGallery, parseEmbedUrl }
export type { MediaItem, MediaGalleryProps, MediaType }
