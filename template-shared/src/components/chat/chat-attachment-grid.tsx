'use client'

import * as React from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAX_VISIBLE_IMAGES } from '@/components/chat/chat-constants'

export type ChatAttachmentGridProps = {
  urls: string[]
  isVideo: (url: string) => boolean
  onOpenImage: (url: string) => void
  className?: string
}

/**
 * WhatsApp-style album: one large preview for a single attachment, an even grid
 * for two to four, and a "+N" overlay on the 4th tile when there are more.
 */
export function ChatAttachmentGrid({
  urls,
  isVideo,
  onOpenImage,
  className,
}: ChatAttachmentGridProps): React.JSX.Element | null {
  if (urls.length === 0) return null

  const visible = urls.slice(0, MAX_VISIBLE_IMAGES)
  // How many images sit behind the 4th tile (WhatsApp: 5 total → +1, 7 → +3).
  const remaining = Math.max(0, urls.length - MAX_VISIBLE_IMAGES)

  if (urls.length === 1) {
    const url = urls[0]
    return (
      <div className={cn('w-full overflow-hidden rounded-lg', className)}>
        {isVideo(url) ? (
          <video src={url} controls muted playsInline className="max-h-72 w-full bg-black/20" />
        ) : (
          <Thumbnail
            url={url}
            onOpen={() => onOpenImage(url)}
            className="aspect-4/3 max-h-72 w-full"
          />
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid w-full grid-cols-2 gap-0.5 overflow-hidden rounded-lg',
        className
      )}
    >
      {visible.map((url, index) => {
        const wide = urls.length === 3 && index === 0
        const showPlus =
          remaining > 0 && index === MAX_VISIBLE_IMAGES - 1

        return (
          <div
            key={`${url}-${index}`}
            className={cn(
              'relative min-w-0 bg-black/10',
              wide ? 'col-span-2 aspect-2/1' : 'aspect-square'
            )}
          >
            {isVideo(url) ? (
              <>
                <video src={url} muted playsInline className="size-full object-cover" />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-black/50 p-2 text-white">
                    <Play className="size-4 fill-current" />
                  </span>
                </span>
                {showPlus ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-medium text-white">
                    +{remaining}
                  </span>
                ) : null}
              </>
            ) : (
              <Thumbnail
                url={url}
                onOpen={() => onOpenImage(url)}
                className="size-full"
                label={
                  showPlus ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-medium text-white">
                      +{remaining}
                    </span>
                  ) : null
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Thumbnail({
  url,
  onOpen,
  className,
  label,
}: {
  url: string
  onOpen: () => void
  className?: string
  label?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="View image"
      className={cn('relative block cursor-zoom-in', className)}
    >
      <img src={url} alt="" className="size-full object-cover" />
      {label}
    </button>
  )
}
