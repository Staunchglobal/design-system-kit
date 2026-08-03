'use client'

import * as React from 'react'
import { FileText, Paperclip, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ATTACHMENT_ACCEPT,
  MAX_ATTACHMENTS,
  MAX_FILE_SIZE,
  MAX_VISIBLE_IMAGES,
  isAcceptedAttachment,
  isImageAttachment,
} from '@/components/chat/chat-constants'
import { ChatErrorBanner } from '@/components/chat/chat-status'
import { toast } from '@/components/auth/notify'

export type ChatComposerProps = {
  onSend: (content: string, files: File[]) => Promise<void> | void
  sending?: boolean
  disabled?: boolean
  error?: string | null
  onClearError?: () => void
}

type PreviewItem = {
  key: string
  file: File
  url: string
  isImage: boolean
}

export function ChatComposer({
  onSend,
  sending,
  disabled,
  error,
  onClearError,
}: ChatComposerProps): React.JSX.Element {
  const [text, setText] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [previews, setPreviews] = React.useState<PreviewItem[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const next = files.map((file, i) => ({
      key: `${file.name}-${file.size}-${file.lastModified}-${i}`,
      file,
      url: isImageAttachment(file) ? URL.createObjectURL(file) : '',
      isImage: isImageAttachment(file),
    }))
    setPreviews(next)
    return () => {
      next.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url)
      })
    }
  }, [files])

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...files]
    let oversized = 0
    let rejectedType = 0
    let skippedLimit = 0

    for (const file of Array.from(list)) {
      if (next.length >= MAX_ATTACHMENTS) {
        skippedLimit += 1
        continue
      }
      if (!isAcceptedAttachment(file)) {
        rejectedType += 1
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        oversized += 1
        continue
      }
      next.push(file)
    }

    if (oversized > 0) {
      toast.error(
        oversized === 1
          ? 'File must be 15 MB or smaller'
          : `${oversized} files were larger than 15 MB and were not added`
      )
    }
    if (rejectedType > 0) {
      toast.error('Only images (PNG, JPG) and documents (PDF, DOC, DOCX) are allowed')
    }
    if (skippedLimit > 0) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} files per message`)
    }
    setFiles(next)
  }

  async function handleSend() {
    if (sending || disabled) return
    if (!text.trim() && files.length === 0) return
    onClearError?.()
    try {
      await onSend(text.trim(), files)
      setText('')
      setFiles([])
    } catch {
      // Parent sets error; keep draft so the user can retry.
    }
  }

  const atLimit = files.length >= MAX_ATTACHMENTS
  const attachDisabled = Boolean(disabled || sending || atLimit)
  const imagePreviews = previews.filter((p) => p.isImage)
  const docPreviews = previews.filter((p) => !p.isImage)
  const visibleImages = imagePreviews.slice(0, MAX_VISIBLE_IMAGES)
  const hiddenImageCount = Math.max(0, imagePreviews.length - MAX_VISIBLE_IMAGES)

  function removeFile(target: PreviewItem) {
    setFiles((prev) => {
      const idx = prev.findIndex(
        (f) =>
          f.name === target.file.name &&
          f.size === target.file.size &&
          f.lastModified === target.file.lastModified
      )
      if (idx < 0) return prev
      return prev.filter((_, i) => i !== idx)
    })
  }

  const attachButton = (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Attach files"
      disabled={attachDisabled}
      onClick={atLimit ? undefined : () => inputRef.current?.click()}
    >
      <Paperclip className="size-4" />
    </Button>
  )

  return (
    <div className="space-y-2 border-t p-3">
      {error ? (
        <ChatErrorBanner
          title="Couldn't send message"
          message={error}
          onRetry={() => void handleSend()}
        />
      ) : null}
      {previews.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {docPreviews.map((item) => (
            <div
              key={item.key}
              className="bg-muted relative flex h-16 max-w-40 items-center gap-1.5 overflow-hidden rounded-md border pr-7 pl-2"
            >
              <FileText className="text-muted-foreground size-4 shrink-0" />
              <span className="truncate text-xs">{item.file.name}</span>
              <button
                type="button"
                aria-label="Remove file"
                className="bg-background absolute top-0.5 right-0.5 z-10 rounded-full border p-0.5"
                disabled={sending}
                onClick={() => removeFile(item)}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {visibleImages.map((item, i) => {
            const showMore = hiddenImageCount > 0 && i === visibleImages.length - 1
            return (
              <div
                key={item.key}
                className="bg-muted relative size-16 overflow-hidden rounded-md border"
              >
                <img src={item.url} alt="" className="size-full object-cover" />
                {showMore ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                    +{hiddenImageCount}
                  </div>
                ) : null}
                <button
                  type="button"
                  aria-label="Remove file"
                  className="bg-background absolute top-0.5 right-0.5 z-10 rounded-full border p-0.5"
                  disabled={sending}
                  onClick={() => removeFile(item)}
                >
                  <X className="size-3" />
                </button>
              </div>
            )
          })}
          {hiddenImageCount > 0 ? (
            <p className="text-muted-foreground self-center text-xs">
              {imagePreviews.length} images selected
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ATTACHMENT_ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        {atLimit ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">{attachButton}</span>
              </TooltipTrigger>
              <TooltipContent side="top">
                Please remove previous items to add more (max {MAX_ATTACHMENTS})
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          attachButton
        )}
        <Textarea
          value={text}
          onChange={(e) => {
            onClearError?.()
            setText(e.target.value)
          }}
          placeholder="Type a message…"
          rows={1}
          style={{ '--textarea-min-height': '3rem' } as React.CSSProperties}
          className="max-h-32 min-h-12 flex-1 resize-none overflow-y-auto"
          disabled={disabled || sending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          disabled={disabled || sending || (!text.trim() && files.length === 0)}
          onClick={() => void handleSend()}
        >
          {sending ? <Spinner className="size-4" /> : <Send className="size-4" />}
          <span className="sr-only">{sending ? 'Sending' : 'Send'}</span>
        </Button>
      </div>
    </div>
  )
}
