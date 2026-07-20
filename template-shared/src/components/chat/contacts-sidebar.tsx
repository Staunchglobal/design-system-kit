'use client'

import { ImageIcon, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChatErrorPanel,
  ChatListSkeleton,
} from '@/components/chat/chat-status'
import type { ChatTab, Conversation } from '@/components/chat/types'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export type ContactsSidebarProps = {
  tab: ChatTab
  onTabChange: (tab: ChatTab) => void
  search: string
  onSearchChange: (value: string) => void
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
  const showInitialLoading = Boolean(loading && conversations.length === 0 && !error)
  const showEmpty = !loading && !error && conversations.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">Messages</h2>
          {typeof totalUnread === 'number' && totalUnread > 0 ? (
            <p className="text-muted-foreground text-xs">{totalUnread} unread</p>
          ) : null}
        </div>
        <Button size="sm" onClick={onNewChat}>
          New
        </Button>
      </div>

      <div className="space-y-3 border-b p-3">
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
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
            className="pl-8"
            disabled={Boolean(loading && conversations.length === 0)}
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {showInitialLoading ? <ChatListSkeleton /> : null}
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
            <p className="text-muted-foreground p-4 text-sm">No conversations</p>
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
                  'hover:bg-muted flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                  selectedId === c.id && 'bg-muted'
                )}
              >
                <Avatar className="size-10">
                  {c.avatar ? <AvatarImage src={c.avatar} alt={c.name} /> : null}
                  <AvatarFallback>{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    {c.unreadCount > 0 ? (
                      <Badge variant="default" className="h-5 min-w-5 px-1.5">
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
  )
}
