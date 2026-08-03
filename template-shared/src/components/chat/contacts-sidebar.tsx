'use client'

import type { CSSProperties } from 'react'
import { Archive, ImageIcon, MessageSquarePlus, Plus, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChatErrorPanel,
  ChatListSkeleton,
} from '@/components/chat/chat-status'
import { ChatEmptyState } from '@/components/chat/chat-empty-state'
import { ChatSearchField } from '@/components/chat/chat-search-field'
import { personInitials } from '@/components/chat/chat-utils'
import type { ChatTab, Conversation } from '@/components/chat/types'

// A count badge wants to stay compact; the theme's default pill padding is too wide.
const unreadBadgeStyle = {
  '--badge-height': '1.25rem',
  '--badge-padding-x': '0.375rem',
} as CSSProperties
export type ContactsSidebarProps = {
  tab: ChatTab
  onTabChange: (tab: ChatTab) => void
  search: string
  onSearchChange: (value: string) => void
  searching?: boolean
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading?: boolean
  loadingMore?: boolean
  error?: string | null
  onRetry?: () => void
  onNewChat: () => void
  onLoadMore?: () => void
  hasMore?: boolean
  totalUnread?: number
}

export function ContactsSidebar({
  tab,
  onTabChange,
  search,
  onSearchChange,
  searching,
  conversations,
  selectedId,
  onSelect,
  loading,
  loadingMore,
  error,
  onRetry,
  onNewChat,
  onLoadMore,
  hasMore,
  totalUnread,
}: ContactsSidebarProps) {
  const showInitialLoading = Boolean(loading && conversations.length === 0 && !error && !search)
  const showSearchLoading = Boolean(searching || (loading && conversations.length === 0 && search))
  const showEmpty = !loading && !searching && !error && conversations.length === 0

  return (
    <div className="bg-background flex h-full min-h-0 flex-col gap-6 px-3 pt-7 pb-3">
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Inbox</h2>
            {typeof totalUnread === 'number' && totalUnread > 0 ? (
              <p className="text-muted-foreground text-xs">{totalUnread} unread</p>
            ) : null}
          </div>
          <Button
            size="sm"
            className="shrink-0 px-2"
            onClick={onNewChat}
            aria-label="New chat"
          >
            <Plus className="size-4" />
            <span className="sr-only sm:not-sr-only sm:inline">New</span>
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => onTabChange(v as ChatTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="chats" className="flex-1">
              Chats
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex-1">
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ChatSearchField
          value={search}
          onChange={onSearchChange}
          searching={searching}
          placeholder="Search conversation"
          aria-label="Search conversations"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {tab === 'chats' && !showEmpty && !showInitialLoading && !showSearchLoading ? (
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Chats
          </p>
        ) : null}

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-0.5">
            {showInitialLoading || (showSearchLoading && conversations.length === 0) ? (
              <ChatListSkeleton />
            ) : null}
            {error && conversations.length === 0 ? (
              <ChatErrorPanel
                title="Couldn't load chats"
                message={error}
                onRetry={onRetry}
              />
            ) : null}
            {error && conversations.length > 0 ? (
              <ChatErrorPanel
                title="Couldn't refresh chats"
                message={error}
                onRetry={onRetry}
                className="py-2"
              />
            ) : null}
            {showEmpty ? (
              <ChatEmptyState
                size="sm"
                className="py-8"
                icon={search ? <SearchX /> : tab === 'archived' ? <Archive /> : <MessageSquarePlus />}
                title={
                  search
                    ? tab === 'archived'
                      ? 'No archived conversations found'
                      : 'No conversations found'
                    : tab === 'archived'
                      ? 'No archived conversations'
                      : 'No conversations yet'
                }
                description={
                  search
                    ? 'Try a different name or keyword.'
                    : tab === 'archived'
                      ? 'Conversations you archive will show up here.'
                      : 'Start a new chat to begin messaging.'
                }
                action={
                  !search && tab === 'chats' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onNewChat}
                    >
                      <Plus />
                      Add Chat
                    </Button>
                  ) : null
                }
              />
            ) : null}
            {conversations.map((c) => {
              const preview =
                !c.lastMessage && (c.lastAttachmentUrls?.length ?? 0) > 0
                  ? 'Photo'
                  : c.lastMessage
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    'hover:bg-muted flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                    selectedId === c.id && 'bg-muted'
                  )}
                >
                  <Avatar size="lg">
                    {c.avatar ? <AvatarImage src={c.avatar} alt={c.name} /> : null}
                    <AvatarFallback>{personInitials(c.name, c.email)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.name}</span>
                      {c.unreadCount > 0 ? (
                        <Badge
                          variant="default"
                          className="min-w-5 justify-center"
                          style={unreadBadgeStyle}
                        >
                          {c.unreadCount}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                      {(c.lastAttachmentUrls?.length ?? 0) > 0 ? (
                        <ImageIcon className="size-3 shrink-0" />
                      ) : null}
                      <span className="truncate">{preview || 'No messages yet'}</span>
                    </p>
                  </div>
                </button>
              )
            })}
            {hasMore ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={onLoadMore}
                disabled={loadingMore || loading}
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="size-3.5" />
                    Loading…
                  </span>
                ) : (
                  'Load more'
                )}
              </Button>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
