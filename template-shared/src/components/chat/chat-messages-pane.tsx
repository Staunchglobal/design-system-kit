'use client'

import * as React from 'react'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@/components/ui/message-scroller'
import { MessageGroup } from '@/components/ui/message'
import { Spinner } from '@/components/ui/spinner'
import { ChatMessageRow } from '@/components/chat/chat-message-row'
import {
  ChatErrorPanel,
  ChatMessagesSkeleton,
} from '@/components/chat/chat-status'
import type { ChatMessage } from '@/components/chat/types'

/**
 * Keeps the latest message above the composer. Re-runs after layout/images
 * settle — otherwise tall albums land behind the input until you scroll.
 */
function ScrollToLatest({
  messages,
}: {
  messages: ChatMessage[]
}) {
  const { scrollToEnd } = useMessageScroller()
  const last = messages[messages.length - 1]
  const lastId = last?.id
  const lastMediaKey = last
    ? `${last.attachmentUrls?.join('|') ?? ''}:${last.attachments?.map((a) => a.url).join('|') ?? ''}`
    : ''
  const primedRef = React.useRef(false)
  const prevLastIdRef = React.useRef<string | null>(null)
  const followRef = React.useRef(true)

  const stickToEnd = React.useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      scrollToEnd({ behavior, align: 'end' })
      // Image grids / fonts change height after the first paint — pin again.
      requestAnimationFrame(() => {
        scrollToEnd({ behavior: 'instant', align: 'end' })
        requestAnimationFrame(() => {
          scrollToEnd({ behavior: 'instant', align: 'end' })
        })
      })
    },
    [scrollToEnd]
  )

  React.useEffect(() => {
    if (messages.length === 0) {
      primedRef.current = false
      prevLastIdRef.current = null
      followRef.current = true
      return
    }
    if (!lastId) return

    if (!primedRef.current) {
      primedRef.current = true
      prevLastIdRef.current = lastId
      followRef.current = true
      stickToEnd('instant')
      return
    }

    if (lastId !== prevLastIdRef.current) {
      prevLastIdRef.current = lastId
      // Always reveal the latest message in the open thread. (Reading history
      // further up is uncommon in this demo; prefer not leaving it under the input.)
      followRef.current = true
      stickToEnd('smooth')
    }
  }, [lastId, messages.length, stickToEnd])

  // Media finishes decoding after the message row mounts — stick again so the
  // album isn't clipped under the composer.
  React.useEffect(() => {
    if (!lastId || !followRef.current) return
    const t = window.setTimeout(() => stickToEnd('instant'), 120)
    return () => window.clearTimeout(t)
  }, [lastId, lastMediaKey, stickToEnd])

  return null
}

export type ChatMessagesPaneProps = {
  messages: ChatMessage[]
  currentUserId: string
  loading?: boolean
  loadingOlder?: boolean
  error?: string | null
  onRetry?: () => void
  onLoadOlder?: () => void
  hasMore?: boolean
}

export function ChatMessagesPane({
  messages,
  currentUserId,
  loading,
  loadingOlder,
  error,
  onRetry,
  onLoadOlder,
  hasMore,
}: ChatMessagesPaneProps): React.JSX.Element {
  const showInitialLoading = Boolean(loading && messages.length === 0 && !error)
  const showEmpty = !loading && !error && messages.length === 0

  return (
    <MessageScrollerProvider
      autoScroll
      defaultScrollPosition="end"
      scrollMargin={16}
      scrollEdgeThreshold={80}
    >
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="gap-4 p-4 pb-6">
            {error && messages.length === 0 ? (
              <ChatErrorPanel
                title="Couldn't load messages"
                message={error}
                onRetry={onRetry}
              />
            ) : null}
            {error && messages.length > 0 ? (
              <ChatErrorPanel
                title="Couldn't refresh messages"
                message={error}
                onRetry={onRetry}
                className="py-0"
              />
            ) : null}
            {hasMore && !error ? (
              <button
                type="button"
                className="text-muted-foreground mx-auto inline-flex items-center gap-2 text-xs underline disabled:no-underline"
                onClick={onLoadOlder}
                disabled={loadingOlder || loading}
              >
                {loadingOlder ? (
                  <>
                    <Spinner className="size-3" />
                    Loading older…
                  </>
                ) : (
                  'Load older messages'
                )}
              </button>
            ) : null}
            {showInitialLoading ? <ChatMessagesSkeleton /> : null}
            {showEmpty ? (
              <p className="text-muted-foreground text-center text-sm">
                No messages yet. Say hello.
              </p>
            ) : null}
            <MessageGroup>
              {messages.map((m, idx) => (
                <MessageScrollerItem
                  key={m.id}
                  messageId={m.id}
                  scrollAnchor={idx === messages.length - 1}
                  // content-visibility + a 10rem guess underestimates image albums
                  // and leaves the latest message under the composer.
                  className="[content-visibility:visible] [contain-intrinsic-size:none]"
                >
                  <ChatMessageRow message={m} isMine={m.sender.id === currentUserId} />
                </MessageScrollerItem>
              ))}
            </MessageGroup>
            <ScrollToLatest messages={messages} />
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
