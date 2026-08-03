'use client'

import * as React from 'react'
import { Download, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from '@/components/ui/message'
import type { ChatAttachment, ChatMessage } from '@/components/chat/types'
import { isDocumentAttachment } from '@/components/chat/chat-constants'
import { ImageLightbox } from '@/components/chat/image-lightbox'
import { ChatAttachmentGrid } from '@/components/chat/chat-attachment-grid'
import { personInitials, personLabels } from '@/components/chat/chat-utils'

/** Media fills the bubble edge-to-edge like WhatsApp; caption gets its own padding. */
const mediaBubbleStyle = {
  '--bubble-content-padding-x': '0px',
  '--bubble-content-padding-y': '0px',
} as React.CSSProperties

/** Keep media / document bubbles a consistent WhatsApp-like width. */
const MEDIA_BUBBLE_WIDTH = 'w-64 max-w-[min(16rem,calc(100%-0.5rem))]'

type DocEntry = {
  url: string
  fileName: string
  mimeType?: string
  sizeBytes?: number
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatFileSize(bytes?: number): string | null {
  if (bytes == null || bytes < 0 || !Number.isFinite(bytes)) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileExtLabel(fileName: string, mimeType?: string): string {
  const ext = fileName.split('.').pop()?.toUpperCase()
  if (ext && ext !== fileName.toUpperCase() && ext.length <= 5) return ext
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType === 'application/msword') return 'DOC'
  if (mimeType?.includes('wordprocessingml')) return 'DOCX'
  return 'FILE'
}

function docBadgeClass(label: string): string {
  if (label === 'PDF') return 'bg-[#e53935]'
  if (label === 'DOC' || label === 'DOCX') return 'bg-[#1e88e5]'
  return 'bg-neutral-500'
}

function attachmentForUrl(message: ChatMessage, url: string): ChatAttachment | undefined {
  return message.attachments?.find((a) => a.url === url)
}

function isVideoUrl(message: ChatMessage, url: string): boolean {
  const mimeType = attachmentForUrl(message, url)?.mimeType
  if (mimeType) return mimeType.startsWith('video/')
  return message.messageType === 'VIDEO'
}

function isDocUrl(message: ChatMessage, url: string): boolean {
  const att = attachmentForUrl(message, url)
  if (att && isDocumentAttachment(att)) return true
  const path = url.split('?')[0]?.toLowerCase() ?? ''
  return /\.(pdf|docx?)$/.test(path)
}

function MessageTime({
  iso,
  onMedia,
  className,
}: {
  iso: string
  onMedia?: boolean
  className?: string
}) {
  const label = formatTime(iso)
  if (!label) return null

  return (
    <time
      dateTime={iso}
      className={cn(
        'text-[0.6875rem] leading-none tabular-nums',
        onMedia ? 'rounded bg-black/45 px-1.5 py-0.5 text-white' : 'text-current/65',
        className
      )}
    >
      {label}
    </time>
  )
}

/**
 * WhatsApp-style body: text wraps; timestamp tucks into the bottom-right of the
 * last line. A trailing spacer reserves room so the time never covers the text
 * or gets clipped by the bubble edge.
 */
function WhatsAppBody({
  text,
  timeIso,
  className,
}: {
  text: string
  timeIso: string
  className?: string
}) {
  return (
    <div className={cn('relative px-2.5 pt-1.5 pb-1.5', className)}>
      <p className="overflow-wrap-anywhere whitespace-pre-wrap break-words">
        {text}
        <span aria-hidden className="inline-block w-14 align-middle" />
      </p>
      <MessageTime iso={timeIso} className="absolute right-2.5 bottom-1.5" />
    </div>
  )
}

/** WhatsApp-style document card: type badge, filename, meta, download affordance. */
function DocumentCards({ docs }: { docs: DocEntry[] }) {
  if (docs.length === 0) return null

  return (
    <div className="flex flex-col gap-1 p-1.5 pb-0">
      {docs.map((doc) => {
        const label = fileExtLabel(doc.fileName, doc.mimeType)
        const size = formatFileSize(doc.sizeBytes)
        const meta = [label, size].filter(Boolean).join(' · ')

        return (
          <a
            key={doc.url}
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            download={doc.fileName}
            className="flex items-center gap-2.5 rounded-lg bg-black/5 px-2.5 py-2.5 transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
          >
            <div
              className={cn(
                'flex size-11 shrink-0 flex-col items-center justify-center rounded-md text-white shadow-sm',
                docBadgeClass(label)
              )}
            >
              <FileText className="size-4 stroke-[2.25]" />
              <span className="mt-0.5 text-[0.55rem] leading-none font-bold tracking-wide">
                {label}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] leading-snug font-medium">{doc.fileName}</p>
              {meta ? (
                <p className="text-current/55 mt-0.5 text-[0.6875rem] leading-none">{meta}</p>
              ) : null}
            </div>
            <span
              className="text-current/55 border-current/20 flex size-8 shrink-0 items-center justify-center rounded-full border"
              aria-hidden
            >
              <Download className="size-3.5" />
            </span>
          </a>
        )
      })}
    </div>
  )
}

export function ChatMessageRow({
  message,
  isMine,
}: {
  message: ChatMessage
  isMine: boolean
}) {
  const [lightbox, setLightbox] = React.useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  })
  const urls = message.attachmentUrls?.length
    ? message.attachmentUrls
    : message.attachments?.map((a) => a.url) ?? []

  const documentEntries: DocEntry[] = urls
    .filter((url) => isDocUrl(message, url))
    .map((url) => {
      const att = attachmentForUrl(message, url)
      return {
        url,
        fileName: att?.fileName || url.split('/').pop()?.split('?')[0] || 'Document',
        mimeType: att?.mimeType,
        sizeBytes: att?.sizeBytes,
      }
    })
  const mediaUrls = urls.filter((url) => !isDocUrl(message, url))
  const imageUrls = mediaUrls.filter((url) => !isVideoUrl(message, url))

  const senderName = personLabels(message.sender.fullName, message.sender.email).primary
  const hasMedia = mediaUrls.length > 0
  const hasDocs = documentEntries.length > 0
  const hasAttachments = hasMedia || hasDocs
  const hasText = Boolean(message.content?.trim())
  const mediaOnly = hasAttachments && !hasText

  return (
    <>
      <Message align={isMine ? 'end' : 'start'}>
        <MessageAvatar>
          <Avatar>
            {message.sender.imageUrl ? (
              <AvatarImage src={message.sender.imageUrl} alt={senderName} />
            ) : null}
            <AvatarFallback>
              {personInitials(message.sender.fullName, message.sender.email)}
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          {!isMine ? (
            <MessageHeader>
              <span className="text-foreground font-medium">{senderName}</span>
            </MessageHeader>
          ) : null}
          <Bubble
            variant={isMine ? 'default' : 'secondary'}
            align={isMine ? 'end' : 'start'}
            className={cn(hasAttachments && MEDIA_BUBBLE_WIDTH)}
          >
            <BubbleContent
              style={hasAttachments ? mediaBubbleStyle : undefined}
              className={cn(
                hasAttachments && cn(MEDIA_BUBBLE_WIDTH, 'overflow-hidden p-0')
              )}
            >
              {hasDocs ? <DocumentCards docs={documentEntries} /> : null}
              {hasMedia ? (
                <div className="relative w-full">
                  <ChatAttachmentGrid
                    urls={mediaUrls}
                    isVideo={(url) => isVideoUrl(message, url)}
                    onOpenImage={(url) =>
                      setLightbox({ open: true, index: Math.max(imageUrls.indexOf(url), 0) })
                    }
                    className="w-full max-w-none rounded-none"
                  />
                  {mediaOnly && !hasDocs ? (
                    <MessageTime
                      iso={message.createdAt}
                      onMedia
                      className="absolute right-2 bottom-2 z-10"
                    />
                  ) : null}
                </div>
              ) : null}
              {hasText ? (
                <WhatsAppBody text={message.content!} timeIso={message.createdAt} />
              ) : null}
              {mediaOnly && hasDocs ? (
                <div className="relative px-2.5 pt-1 pb-1.5">
                  <span aria-hidden className="inline-block h-3 w-14" />
                  <MessageTime iso={message.createdAt} className="absolute right-2.5 bottom-1.5" />
                </div>
              ) : null}
              {!hasAttachments && !hasText ? (
                <div className="flex justify-end px-1">
                  <MessageTime iso={message.createdAt} />
                </div>
              ) : null}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <ImageLightbox
        urls={imageUrls}
        index={lightbox.index}
        open={lightbox.open}
        onOpenChange={(open) => setLightbox((s) => ({ ...s, open }))}
      />
    </>
  )
}
