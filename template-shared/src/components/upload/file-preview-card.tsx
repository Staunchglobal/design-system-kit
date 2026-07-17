'use client'

import { FileIcon, RefreshCw, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type FilePreviewCardProps = {
  file: File
  onRemove: () => void
  onReplace?: () => void
  error?: string
  className?: string
}

function FilePreviewCard({ file, onRemove, onReplace, error, className }: FilePreviewCardProps) {
  return (
    <Item
      data-slot="file-preview-card"
      variant="outline"
      className={cn(error && 'border-destructive/50', className)}
    >
      <ItemMedia variant="icon" className="bg-muted flex size-9 items-center justify-center rounded-lg">
        <FileIcon className="size-4" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="max-w-full truncate">{file.name}</ItemTitle>
        <ItemDescription>
          {formatBytes(file.size)}
          {error ? <span className="text-destructive"> · {error}</span> : null}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
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
        <Button type="button" variant="ghost" size="icon-xs" aria-label="Remove file" onClick={onRemove}>
          <X className="size-3.5" />
        </Button>
      </ItemActions>
    </Item>
  )
}

export { FilePreviewCard, formatBytes }
export type { FilePreviewCardProps }
