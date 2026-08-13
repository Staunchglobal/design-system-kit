'use client'

import * as React from 'react'
import { Upload } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FilePreviewCard } from '@/components/upload/file-preview-card'
import { useFileDrop, type RejectedFile } from '@/components/upload/use-file-drop'

type DropzoneFile = {
  file: File
  error?: string
}

type DropzoneProps = {
  accept?: string
  maxSizeBytes?: number
  multiple?: boolean
  value?: File[]
  onValueChange?: (files: File[]) => void
  className?: string
  disabled?: boolean
}

function Dropzone({
  accept,
  maxSizeBytes,
  multiple = false,
  value,
  onValueChange,
  className,
  disabled = false,
}: DropzoneProps) {
  // Rejected files always live in local state — even in controlled mode — since a
  // controlled `value` is plain `File[]` and can never carry per-file error info, and
  // rejected files must never be reported through `onValueChange` (which only ever
  // carries valid files, per the documented contract).
  const [internalAccepted, setInternalAccepted] = React.useState<File[]>([])
  const [rejected, setRejected] = React.useState<DropzoneFile[]>([])
  const controlled = value != null
  const acceptedFiles = controlled ? value : internalAccepted

  const setAccepted = React.useCallback(
    (next: File[]) => {
      if (!controlled) setInternalAccepted(next)
      onValueChange?.(next)
    },
    [controlled, onValueChange]
  )

  const { isDragging, inputRef, dragHandlers, openBrowser, onInputChange } = useFileDrop({
    accept,
    maxSizeBytes,
    multiple,
    onFiles: (accepted, rejectedNow) => {
      // Defensive: never treat oversized / invalid files as accepted.
      const safeAccepted =
        maxSizeBytes != null
          ? accepted.filter((file) => file.size <= maxSizeBytes)
          : accepted
      const leaked = accepted.filter((file) => !safeAccepted.includes(file))
      const mappedRejected: DropzoneFile[] = [
        ...rejectedNow.map((r: RejectedFile) => ({
          file: r.file,
          error: r.reason,
        })),
        ...leaked.map((file) => ({
          file,
          error:
            maxSizeBytes != null
              ? `File exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(1)} MB limit`
              : 'File rejected',
        })),
      ]

      if (multiple) {
        if (safeAccepted.length > 0) {
          setAccepted([...acceptedFiles, ...safeAccepted])
        }
        if (mappedRejected.length > 0) {
          setRejected((prev) => [...prev, ...mappedRejected])
        }
      } else if (safeAccepted.length > 0) {
        setAccepted(safeAccepted.slice(0, 1))
        setRejected([])
      } else {
        // Rejected-only selection: do not clear / replace an existing valid file
        // via onValueChange — only surface the rejection error.
        setRejected(mappedRejected.slice(0, 1))
      }
    },
  })

  function removeAt(kind: 'accepted' | 'rejected', index: number) {
    if (kind === 'accepted') {
      setAccepted(acceptedFiles.filter((_, i) => i !== index))
    } else {
      setRejected((prev) => prev.filter((_, i) => i !== index))
    }
  }

  function handleZoneClick() {
    if (disabled) return
    openBrowser()
  }

  function handleZoneKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openBrowser()
    }
  }

  return (
    <div data-slot="dropzone" className={cn('space-y-3', className)}>
      <Card
        {...(disabled ? {} : dragHandlers)}
        role={disabled ? undefined : 'button'}
        tabIndex={disabled ? undefined : 0}
        aria-disabled={disabled || undefined}
        onClick={handleZoneClick}
        onKeyDown={handleZoneKeyDown}
        className={cn(
          'border-dashed py-8 transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          !disabled && 'cursor-pointer',
          isDragging && 'border-primary bg-muted',
          disabled && 'pointer-events-none opacity-50'
        )}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg">
            <Upload className="size-5" />
          </div>
          <p className="text-sm font-medium">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-muted-foreground text-xs">
            or{' '}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                openBrowser()
              }}
            >
              browse
            </Button>{' '}
            to choose files
          </p>
          {accept || maxSizeBytes ? (
            <p className="text-muted-foreground text-xs">
              {accept ? `Accepts ${accept}` : null}
              {accept && maxSizeBytes ? ' · ' : null}
              {maxSizeBytes
                ? `Max ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB`
                : null}
            </p>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={onInputChange}
          onClick={(e) => e.stopPropagation()}
        />
      </Card>

      {acceptedFiles.length > 0 || rejected.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {acceptedFiles.map((file, index) => (
            <li key={`accepted-${file.name}-${file.size}-${index}`}>
              <FilePreviewCard
                file={file}
                onRemove={() => removeAt('accepted', index)}
                onReplace={
                  multiple
                    ? undefined
                    : () => {
                        openBrowser()
                      }
                }
              />
            </li>
          ))}
          {rejected.map((entry, index) => (
            <li key={`rejected-${entry.file.name}-${entry.file.size}-${index}`}>
              <FilePreviewCard
                file={entry.file}
                error={entry.error}
                onRemove={() => removeAt('rejected', index)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export { Dropzone }
export type { DropzoneProps }
