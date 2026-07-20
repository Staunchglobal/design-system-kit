'use client'

import * as React from 'react'
import { AddChatDialog } from '@/components/chat/add-chat-dialog'
import { ArchiveChatDialog } from '@/components/chat/archive-chat-dialog'
import { ChatComposer } from '@/components/chat/chat-composer'
import { ChatEmptySelection } from '@/components/chat/chat-empty-selection'
import { ChatHeader } from '@/components/chat/chat-header'
import { ChatMessagesPane } from '@/components/chat/chat-messages-pane'
import { ChatShell } from '@/components/chat/chat-shell'
import { ContactsSidebar } from '@/components/chat/contacts-sidebar'
import {
  useChatInbox,
  type UseChatInboxOptions,
} from '@/components/chat/use-chat-inbox'

export type ChatInboxProps = UseChatInboxOptions & {
  className?: string
}

export function ChatInbox({
  className,
  ...options
}: ChatInboxProps): React.JSX.Element {
  const inbox = useChatInbox(options)
  const threadId = inbox.selectedId
  // Prefer the selected conversation's own isActive flag when it's loaded (the real,
  // per-chat signal) — only fall back to "which tab is open" for the moment before the
  // list has loaded or for a deep-linked chat that isn't in it yet.
  const isSelectedArchived = inbox.selected ? !inbox.selected.isActive : inbox.tab === 'archived'

  return (
    <>
      <ChatShell
        className={className}
        sidebar={
          <ContactsSidebar
            tab={inbox.tab}
            onTabChange={inbox.setTab}
            search={inbox.searchInput}
            onSearchChange={inbox.setSearchInput}
            conversations={inbox.conversations}
            selectedId={inbox.selectedId}
            onSelect={inbox.setSelectedId}
            loading={inbox.chatsLoading}
            loadingMore={inbox.chatsLoadingMore}
            error={inbox.chatsError}
            onRetry={() => void inbox.loadChats(1, false)}
            onNewChat={() => {
              inbox.setNewChatOpen(true)
            }}
            hasMore={inbox.chatsHasMore}
            onLoadMore={inbox.loadMoreChats}
            totalUnread={inbox.totalUnread}
          />
        }
      >
        {inbox.showThread && threadId ? (
          <>
            <ChatHeader
              name={inbox.selected?.name ?? 'Conversation'}
              avatar={inbox.selected?.avatar}
              email={inbox.selected?.email}
              archived={isSelectedArchived}
              onArchiveToggle={inbox.openArchive}
            />
            <ChatMessagesPane
              key={threadId}
              messages={inbox.messages}
              currentUserId={inbox.currentUserId}
              loading={inbox.messagesLoading}
              loadingOlder={inbox.messagesLoadingOlder}
              error={inbox.messagesError}
              onRetry={() => void inbox.loadMessages(threadId, 1, false)}
              hasMore={inbox.messagesHasMore}
              onLoadOlder={inbox.loadOlderMessages}
            />
            <ChatComposer
              onSend={inbox.handleSend}
              sending={inbox.sending}
              disabled={isSelectedArchived}
              error={inbox.sendError}
              onClearError={inbox.clearSendError}
            />
          </>
        ) : (
          <ChatEmptySelection />
        )}
      </ChatShell>

      <AddChatDialog
        open={inbox.newChatOpen}
        onOpenChange={(open) => {
          if (open) inbox.setNewChatOpen(true)
          else inbox.closeNewChat()
        }}
        users={inbox.availableUsers}
        loading={inbox.usersLoading}
        creating={inbox.creatingChat}
        error={inbox.usersError}
        createError={inbox.createChatError}
        onRetry={() => void inbox.loadUsers()}
        search={inbox.userSearch}
        onSearchChange={inbox.setUserSearch}
        onSelect={(id) => void inbox.handleCreateChat(id)}
      />
      <ArchiveChatDialog
        open={inbox.archiveOpen}
        onOpenChange={(open) => {
          if (open) inbox.setArchiveOpen(true)
          else inbox.closeArchive()
        }}
        archived={isSelectedArchived}
        loading={inbox.archiving}
        error={inbox.archiveError}
        onConfirm={() => void inbox.handleArchiveConfirm()}
        onRetry={() => void inbox.handleArchiveConfirm()}
      />
    </>
  )
}
