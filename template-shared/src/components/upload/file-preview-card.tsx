'use client'

import * as React from 'react'
import { FileIcon, RefreshCw, X } from 'lucide-react'

import { cn, formatBytes } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

type FilePreviewCardProps = {
  file: File
  onRemove: () => void
  onReplace?: () => void
  error?: string
  className?: string
}

function FilePreviewCard({ file, onRemove, onReplace, error, className }: FilePreviewCardProps) {
  const isImage = file.type.startsWith('image/')
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect -- preview URL must track the current File */
  React.useEffect(() => {
    if (!isImage) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <Item
      data-slot="file-preview-card"
      variant="outline"
      size="sm"
      className={cn(
        'flex-nowrap gap-2.5 rounded-lg border-border px-3 py-2.5',
        error && 'border-destructive/50',
        className
      )}
    >
      {previewUrl ? (
        <ItemMedia variant="image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" />
        </ItemMedia>
      ) : (
        <ItemMedia
          variant="icon"
          className="bg-muted flex size-9 items-center justify-center rounded-lg"
        >
          <FileIcon className="size-4" />
        </ItemMedia>
      )}
      <ItemContent className="min-w-0">
        <ItemTitle className="max-w-full truncate text-sm font-medium">{file.name}</ItemTitle>
        <ItemDescription className="text-xs">
          {formatBytes(file.size)}
          {error ? <span className="text-destructive"> · {error}</span> : null}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="shrink-0 flex-nowrap">
        {onReplace ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Replace file"
            onClick={onReplace}
          >
            <RefreshCw className="size-3.5" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Remove file"
          onClick={onRemove}
        >
          <X className="size-3.5" />
        </Button>
      </ItemActions>
    </Item>
  )
}

export { FilePreviewCard, formatBytes }
export type { FilePreviewCardProps }
