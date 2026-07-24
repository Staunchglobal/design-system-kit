'use client'

import * as React from 'react'
import {
  Attachment,
  AttachmentMedia,
} from '@/components/ui/attachment'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from '@/components/ui/message'
import type { ChatMessage } from '@/components/chat/types'
import { ImageLightbox } from '@/components/chat/image-lightbox'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
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

  return (
    <>
      <Message align={isMine ? 'end' : 'start'}>
        <MessageAvatar>
          <Avatar className="size-8">
            {message.sender.imageUrl ? (
              <AvatarImage src={message.sender.imageUrl} alt={message.sender.fullName} />
            ) : null}
            <AvatarFallback>{initials(message.sender.fullName)}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <span className="text-foreground font-medium">{message.sender.fullName}</span>
            <span className="ml-2">{formatTime(message.createdAt)}</span>
          </MessageHeader>
          <Bubble variant={isMine ? 'default' : 'secondary'} align={isMine ? 'end' : 'start'}>
            <BubbleContent>
              {message.content ? <p className="whitespace-pre-wrap">{message.content}</p> : null}
              {urls.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {urls.map((url, i) => (
                    <button
                      key={`${url}-${i}`}
                      type="button"
                      aria-label={`View image ${i + 1} of ${urls.length}`}
                      onClick={() => setLightbox({ open: true, index: i })}
                      className="block"
                    >
                      <Attachment orientation="vertical" size="sm" state="done">
                        <AttachmentMedia variant="image">
                          <img src={url} alt="" className="size-full object-cover" />
                        </AttachmentMedia>
                      </Attachment>
                    </button>
                  ))}
                </div>
              ) : null}
            </BubbleContent>
          </Bubble>
          <MessageFooter>{message.messageType === 'IMAGE' ? 'Image' : 'Sent'}</MessageFooter>
        </MessageContent>
      </Message>
      <ImageLightbox
        urls={urls}
        index={lightbox.index}
        open={lightbox.open}
        onOpenChange={(open) => setLightbox((s) => ({ ...s, open }))}
      />
    </>
  )
}
