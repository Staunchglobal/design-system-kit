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
  const files: DropzoneFile[] = [
    ...acceptedFiles.map((file) => ({ file })),
    ...rejected,
  ]

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
      const mappedRejected: DropzoneFile[] = rejectedNow.map((r: RejectedFile) => ({
        file: r.file,
        error: r.reason,
      }))
      if (multiple) {
        setAccepted([...acceptedFiles, ...accepted])
        setRejected((prev) => [...prev, ...mappedRejected])
      } else {
        setAccepted(accepted.slice(0, 1))
        setRejected(accepted.length > 0 ? [] : mappedRejected.slice(0, 1))
      }
    },
  })

  function removeAt(index: number) {
    if (index < acceptedFiles.length) {
      setAccepted(acceptedFiles.filter((_, i) => i !== index))
    } else {
      const rejectedIndex = index - acceptedFiles.length
      setRejected((prev) => prev.filter((_, i) => i !== rejectedIndex))
    }
  }

  return (
    <div data-slot="dropzone" className={cn('space-y-3', className)}>
      <Card
        {...(disabled ? {} : dragHandlers)}
        className={cn(
          'border-dashed py-8 transition-colors',
          isDragging && 'border-primary bg-primary/5',
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
              onClick={openBrowser}
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
        />
      </Card>

      {files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {files.map((entry, index) => (
            <li key={`${entry.file.name}-${entry.file.size}-${index}`}>
              <FilePreviewCard
                file={entry.file}
                error={entry.error}
                onRemove={() => removeAt(index)}
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
        </ul>
      ) : null}
    </div>
  )
}

export { Dropzone }
export type { DropzoneProps }
