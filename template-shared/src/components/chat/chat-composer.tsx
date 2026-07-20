'use client'

import * as React from 'react'
import { ImagePlus, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGES,
} from '@/components/chat/chat-constants'
import { ChatErrorBanner } from '@/components/chat/chat-status'

export type ChatComposerProps = {
  onSend: (content: string, files: File[]) => Promise<void> | void
  sending?: boolean
  disabled?: boolean
  error?: string | null
  onClearError?: () => void
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
  const [previews, setPreviews] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...files]
    for (const file of Array.from(list)) {
      if (next.length >= MAX_IMAGES) break
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) continue
      if (file.size > MAX_FILE_SIZE) continue
      next.push(file)
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
          {previews.map((src, i) => (
            <div key={src} className="relative size-16 overflow-hidden rounded-md border">
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                className="bg-background absolute top-0.5 right-0.5 rounded-full border p-0.5"
                disabled={sending}
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Attach images"
          disabled={disabled || sending || files.length >= MAX_IMAGES}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
        </Button>
        <Textarea
          value={text}
          onChange={(e) => {
            onClearError?.()
            setText(e.target.value)
          }}
          placeholder="Type a message…"
          rows={1}
          className="min-h-10 flex-1 resize-none"
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
