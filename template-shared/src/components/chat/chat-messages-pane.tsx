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
 * Pins the viewport to the latest message on thread open and after the
 * current user sends. Incoming messages while scrolled up rely on
 * MessageScrollerProvider `autoScroll` (near-bottom only).
 */
function ScrollToLatest({
  messages,
  currentUserId,
}: {
  messages: ChatMessage[]
  currentUserId: string
}) {
  const { scrollToEnd } = useMessageScroller()
  const last = messages[messages.length - 1]
  const lastId = last?.id
  const lastIsMine = last?.sender.id === currentUserId
  const primedRef = React.useRef(false)
  const prevLastIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (messages.length === 0) {
      primedRef.current = false
      prevLastIdRef.current = null
      return
    }
    if (!lastId) return

    if (!primedRef.current) {
      primedRef.current = true
      prevLastIdRef.current = lastId
      scrollToEnd({ behavior: 'instant' })
      return
    }

    if (lastId !== prevLastIdRef.current && lastIsMine) {
      prevLastIdRef.current = lastId
      scrollToEnd({ behavior: 'smooth' })
      return
    }

    prevLastIdRef.current = lastId
  }, [lastId, lastIsMine, messages.length, scrollToEnd])

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
    <MessageScrollerProvider autoScroll defaultScrollPosition="end">
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="gap-4 p-4">
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
                >
                  <ChatMessageRow message={m} isMine={m.sender.id === currentUserId} />
                </MessageScrollerItem>
              ))}
            </MessageGroup>
            <ScrollToLatest messages={messages} currentUserId={currentUserId} />
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
