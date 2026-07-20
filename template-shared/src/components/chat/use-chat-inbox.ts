'use client'

import * as React from 'react'
import { getAuthSession } from '@/components/auth/auth-session'
import { toast } from '@/components/auth/notify'
import {
  CHATS_PER_PAGE,
  MESSAGES_PER_PAGE,
} from '@/components/chat/chat-constants'
import { createChatFetch } from '@/components/chat/chat-fetch'
import {
  AllChatsResult,
  ApiChatRow,
  ApiMessageRow,
  mapApiMessage,
  mapConversation,
} from '@/components/chat/chat-mappers'
import {
  ALL_CHATS,
  ARCHIVE_CHAT,
  AVAILABLE_USERS_FOR_CHAT,
  CHAT_REORDERED,
  CREATE_CHAT,
  FETCH_ALL_MESSAGES,
  MARK_CHAT_AS_READ,
  MESSAGE_ADDED,
  SEND_MESSAGE,
  UNREAD_COUNT_UPDATED,
} from '@/components/chat/chat-operations'
import { errorMessage } from '@/components/chat/chat-status'
import { createChatSubscriptions } from '@/components/chat/chat-subscribe'
import { createChatUpload } from '@/components/chat/chat-upload'
import type {
  ChatMessage,
  ChatTab,
  ChatUser,
  Conversation,
} from '@/components/chat/types'

export type UseChatInboxOptions = {
  graphqlUrl?: string
  graphqlWsUrl?: string
  uploadUrl?: string
  currentUserId?: string
  chatId?: string | null
  onChatIdChange?: (chatId: string | null, options?: { tab?: ChatTab }) => void
  tab?: ChatTab
  onTabChange?: (tab: ChatTab) => void
}

export type UseChatInboxResult = {
  currentUserId: string
  tab: ChatTab
  setTab: (tab: ChatTab) => void
  selectedId: string | null
  setSelectedId: (id: string | null, options?: { tab?: ChatTab }) => void
  selected: Conversation | null
  showThread: boolean
  searchInput: string
  setSearchInput: (value: string) => void
  conversations: Conversation[]
  chatsLoading: boolean
  chatsLoadingMore: boolean
  chatsError: string | null
  chatsHasMore: boolean
  loadChats: (page?: number, append?: boolean) => Promise<void>
  loadMoreChats: () => void
  messages: ChatMessage[]
  messagesLoading: boolean
  messagesLoadingOlder: boolean
  messagesError: string | null
  messagesHasMore: boolean
  loadMessages: (chatId: string, page?: number, prepend?: boolean) => Promise<void>
  loadOlderMessages: () => void
  sending: boolean
  sendError: string | null
  clearSendError: () => void
  handleSend: (content: string, files: File[]) => Promise<void>
  totalUnread: number
  newChatOpen: boolean
  setNewChatOpen: (open: boolean) => void
  availableUsers: ChatUser[]
  userSearch: string
  setUserSearch: (value: string) => void
  usersLoading: boolean
  usersError: string | null
  createChatError: string | null
  creatingChat: boolean
  loadUsers: () => Promise<void>
  handleCreateChat: (participantId: string) => Promise<void>
  closeNewChat: () => void
  archiveOpen: boolean
  setArchiveOpen: (open: boolean) => void
  archiving: boolean
  archiveError: string | null
  openArchive: () => void
  closeArchive: () => void
  handleArchiveConfirm: () => Promise<void>
}

export function useChatInbox({
  graphqlUrl,
  graphqlWsUrl,
  uploadUrl,
  currentUserId: currentUserIdProp,
  chatId: chatIdProp,
  onChatIdChange,
  tab: tabProp,
  onTabChange: onTabChangeProp,
}: UseChatInboxOptions): UseChatInboxResult {
  const session = getAuthSession()
  const currentUserId = currentUserIdProp ?? session?.user.id ?? 'user_demo'
  const controlled = chatIdProp !== undefined
  const [internalChatId, setInternalChatId] = React.useState<string | null>(null)
  const selectedId = controlled ? (chatIdProp ?? null) : internalChatId
  const setSelectedId = React.useCallback(
    (id: string | null, options?: { tab?: ChatTab }) => {
      if (onChatIdChange) onChatIdChange(id, options)
      if (!controlled) setInternalChatId(id)
    },
    [controlled, onChatIdChange]
  )

  const tabControlled = tabProp !== undefined
  const [internalTab, setInternalTab] = React.useState<ChatTab>('chats')
  const tab = tabControlled ? tabProp : internalTab
  const setTab = React.useCallback(
    (next: ChatTab) => {
      if (next === tab) return
      // Branch on whether `tab` itself is controlled, not on whether a change handler
      // happens to be passed — otherwise a controlled `tab` with no `onTabChange` falls
      // through to the "uncontrolled" branch below and clears `internalChatId` for no
      // visible reason (the rendered `tab` still comes from the prop, unchanged).
      if (tabControlled) {
        onTabChangeProp?.(next)
        return
      }
      setInternalTab(next)
      if (!controlled) setInternalChatId(null)
    },
    [tab, tabControlled, onTabChangeProp, controlled]
  )

  const chatFetch = React.useMemo(
    () =>
      createChatFetch(
        graphqlUrl
          ? {
              endpoint: graphqlUrl,
              withAuth: true,
            }
          : {}
      ),
    [graphqlUrl]
  )

  const realFetch = React.useMemo(() => {
    if (!graphqlUrl) return chatFetch
    return createChatFetch({
      endpoint: graphqlUrl,
      fetchImpl: async (endpoint, query, variables, headers) => {
        const { graphqlFetch } = await import('@/components/auth/graphql-client')
        return graphqlFetch(endpoint, query, variables, headers)
      },
      withAuth: true,
    })
  }, [graphqlUrl, chatFetch])

  const upload = React.useMemo(() => createChatUpload({ uploadUrl }), [uploadUrl])
  const subs = React.useMemo(
    () => createChatSubscriptions({ url: graphqlWsUrl }),
    [graphqlWsUrl]
  )

  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [chatsNextPage, setChatsNextPage] = React.useState<number | null>(null)
  const [chatsLoading, setChatsLoading] = React.useState(false)
  const [chatsLoadingMore, setChatsLoadingMore] = React.useState(false)
  const [chatsError, setChatsError] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [messagesNextPage, setMessagesNextPage] = React.useState<number | null>(null)
  const [messagesLoading, setMessagesLoading] = React.useState(false)
  const [messagesLoadingOlder, setMessagesLoadingOlder] = React.useState(false)
  const [messagesError, setMessagesError] = React.useState<string | null>(null)
  const [sending, setSending] = React.useState(false)
  const [sendError, setSendError] = React.useState<string | null>(null)
  const [totalUnread, setTotalUnread] = React.useState(0)
  const [newChatOpen, setNewChatOpen] = React.useState(false)
  const [archiveOpen, setArchiveOpen] = React.useState(false)
  const [archiving, setArchiving] = React.useState(false)
  const [archiveError, setArchiveError] = React.useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = React.useState<ChatUser[]>([])
  const [userSearch, setUserSearch] = React.useState('')
  const [debouncedUserSearch, setDebouncedUserSearch] = React.useState('')
  const [usersLoading, setUsersLoading] = React.useState(false)
  const [usersError, setUsersError] = React.useState<string | null>(null)
  const [createChatError, setCreateChatError] = React.useState<string | null>(null)
  const [creatingChat, setCreatingChat] = React.useState(false)
  const usersRequestId = React.useRef(0)

  React.useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedUserSearch(userSearch.trim()), 300)
    return () => window.clearTimeout(t)
  }, [userSearch])

  const loadChats = React.useCallback(
    async (page = 1, append = false): Promise<void> => {
      if (append) setChatsLoadingMore(true)
      else setChatsLoading(true)
      setChatsError(null)
      try {
        const data = await realFetch<AllChatsResult>(ALL_CHATS, {
          page,
          perPage: CHATS_PER_PAGE,
          search: search || undefined,
          archived: tab === 'archived',
        })
        const rows = data.allChats.allData.map(mapConversation)
        setConversations((prev) => (append ? [...prev, ...rows] : rows))
        setChatsNextPage(data.allChats.nextPage)
        if (tab === 'chats' && page === 1) {
          setTotalUnread(rows.reduce((sum, c) => sum + c.unreadCount, 0))
        }
      } catch (err) {
        const message = errorMessage(err, 'Failed to load chats')
        setChatsError(message)
        if (!append) setConversations([])
        toast.error(message)
      } finally {
        setChatsLoading(false)
        setChatsLoadingMore(false)
      }
    },
    [realFetch, search, tab]
  )

  React.useEffect(() => {
    void loadChats(1, false)
  }, [loadChats])

  const loadMessages = React.useCallback(
    async (chatId: string, page = 1, prepend = false): Promise<void> => {
      if (prepend) setMessagesLoadingOlder(true)
      else setMessagesLoading(true)
      setMessagesError(null)
      try {
        const data = await realFetch<{
          fetchAllMessages: {
            allData: ApiMessageRow[]
            nextPage: number | null
          }
        }>(FETCH_ALL_MESSAGES, { chatId, page, perPage: MESSAGES_PER_PAGE })
        const rows = data.fetchAllMessages.allData.map(mapApiMessage).reverse()
        setMessages((prev) => {
          if (prepend) return [...rows, ...prev]
          // Initial (non-prepend) load: the MESSAGE_ADDED subscription for this chat is
          // already active by the time this fetch resolves (both start when `selectedId`
          // changes), so a message sent by the other participant while this historical-page
          // fetch was in flight may already be sitting in `prev`. Don't blindly discard it —
          // keep any same-chat message this fetch's snapshot doesn't already include, and
          // append it after (it's newer than everything the fetch returned).
          const fetchedIds = new Set(rows.map((m) => m.id))
          const liveOnly = prev.filter((m) => m.chatId === chatId && !fetchedIds.has(m.id))
          return liveOnly.length ? [...rows, ...liveOnly] : rows
        })
        setMessagesNextPage(data.fetchAllMessages.nextPage)
        try {
          await realFetch(MARK_CHAT_AS_READ, { chatId })
          setConversations((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
          )
        } catch (err) {
          toast.error(errorMessage(err, 'Failed to mark chat as read'))
        }
      } catch (err) {
        const message = errorMessage(err, 'Failed to load messages')
        setMessagesError(message)
        if (!prepend) setMessages([])
        toast.error(message)
      } finally {
        setMessagesLoading(false)
        setMessagesLoadingOlder(false)
      }
    },
    [realFetch]
  )

  React.useEffect(() => {
    if (!selectedId) {
      setMessages([])
      setMessagesError(null)
      setSendError(null)
      return
    }
    setSendError(null)
    void loadMessages(selectedId, 1, false)
  }, [selectedId, loadMessages])

  React.useEffect(() => {
    if (!selectedId) return
    return subs.subscribe(
      MESSAGE_ADDED,
      { chatId: selectedId },
      (data: { messageAdded?: ApiMessageRow }) => {
        const msg = data.messageAdded
        if (!msg) return
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          try {
            return [...prev, mapApiMessage(msg)]
          } catch {
            return prev
          }
        })
      },
      'messageAdded'
    )
  }, [selectedId, subs])

  React.useEffect(() => {
    return subs.subscribe(
      CHAT_REORDERED,
      { userId: currentUserId },
      (data: { chatReordered?: ApiChatRow }) => {
        const row = data.chatReordered
        if (!row) return
        const mapped = mapConversation(row)
        setConversations((prev) => {
          const without = prev.filter((c) => c.id !== mapped.id)
          // chatReordered is a global per-user subscription, not scoped to a tab — trust
          // the row's own isActive flag to decide whether it belongs in the list currently
          // being viewed, not just "which tab happens to be open" (an archive/unarchive
          // happening elsewhere must not resurrect/hide a chat in the wrong list).
          const belongsInCurrentTab = tab === 'archived' ? !mapped.isActive : mapped.isActive
          return belongsInCurrentTab ? [mapped, ...without] : without
        })
      },
      'chatReordered'
    )
  }, [currentUserId, subs, tab])

  React.useEffect(() => {
    return subs.subscribe(
      UNREAD_COUNT_UPDATED,
      { userId: currentUserId },
      (data: { unreadChatCountUpdated?: { unreadChatCount: number } }) => {
        const n = data.unreadChatCountUpdated?.unreadChatCount
        if (typeof n === 'number') setTotalUnread(n)
      },
      'unreadChatCountUpdated'
    )
  }, [currentUserId, subs])

  const loadUsers = React.useCallback(async (): Promise<void> => {
    const requestId = ++usersRequestId.current
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await realFetch<{
        availableUsersForChat: { allData: ChatUser[] }
      }>(AVAILABLE_USERS_FOR_CHAT, {
        search: debouncedUserSearch || undefined,
        page: 1,
        perPage: 30,
      })
      if (requestId !== usersRequestId.current) return
      setAvailableUsers(data.availableUsersForChat.allData)
      setUsersError(null)
    } catch (err) {
      if (requestId !== usersRequestId.current) return
      setAvailableUsers([])
      setUsersError(errorMessage(err, 'Failed to load people'))
    } finally {
      if (requestId === usersRequestId.current) setUsersLoading(false)
    }
  }, [realFetch, debouncedUserSearch])

  React.useEffect(() => {
    if (!newChatOpen) return
    void loadUsers()
  }, [newChatOpen, loadUsers])

  const selected = conversations.find((c) => c.id === selectedId) ?? null
  const showThread = Boolean(selectedId)

  async function handleSend(content: string, files: File[]): Promise<void> {
    if (!selectedId) return
    setSending(true)
    setSendError(null)
    try {
      const urls = files.length ? await upload(files) : []
      const data = await realFetch<{
        sendMessage: {
          success: boolean
          message?: ApiMessageRow | null
        }
      }>(SEND_MESSAGE, {
        chatId: selectedId,
        content,
        messageType: urls.length ? 'IMAGE' : 'TEXT',
        attachmentUrls: urls.length ? urls : undefined,
      })
      const sent = data.sendMessage.message
      if (sent) {
        const mapped = mapApiMessage(sent)
        setMessages((prev) => {
          if (prev.some((m) => m.id === mapped.id)) return prev
          return [...prev, mapped]
        })
        setConversations((prev) => {
          const next = prev.map((c) =>
            c.id === selectedId
              ? {
                  ...c,
                  lastMessage: mapped.content,
                  lastMessageType: mapped.messageType,
                  lastAttachmentUrls: mapped.attachmentUrls ?? [],
                  timestamp: mapped.createdAt,
                  updatedAt: mapped.createdAt,
                }
              : c
          )
          const row = next.find((c) => c.id === selectedId)
          if (!row) return next
          return [row, ...next.filter((c) => c.id !== selectedId)]
        })
      }
    } catch (err) {
      const message = errorMessage(err, 'Failed to send message')
      setSendError(message)
      toast.error(message)
      throw err instanceof Error ? err : new Error(message)
    } finally {
      setSending(false)
    }
  }

  async function handleCreateChat(participantId: string): Promise<void> {
    setCreatingChat(true)
    setCreateChatError(null)
    try {
      const data = await realFetch<{
        createChat: { chat: { id: string } }
      }>(CREATE_CHAT, { participantId })
      setNewChatOpen(false)
      if (!tabControlled) setInternalTab('chats')
      setSelectedId(data.createChat.chat.id, { tab: 'chats' })
    } catch (err) {
      const message = errorMessage(err, 'Failed to create chat')
      setCreateChatError(message)
      toast.error(message)
    } finally {
      setCreatingChat(false)
    }
  }

  async function handleArchiveConfirm(): Promise<void> {
    if (!selectedId) return
    // Prefer the selected conversation's own isActive flag (the real per-chat state) over
    // "which tab is currently open" — same reasoning as chatReordered's fix above.
    const isCurrentlyActive = selected ? selected.isActive : tab !== 'archived'
    setArchiving(true)
    setArchiveError(null)
    try {
      await realFetch(ARCHIVE_CHAT, {
        chatId: selectedId,
        archive: isCurrentlyActive,
      })
      setArchiveOpen(false)
      setSelectedId(null)
      await loadChats(1, false)
      toast.success(isCurrentlyActive ? 'Chat archived' : 'Chat restored')
    } catch (err) {
      const message = errorMessage(err, 'Archive failed')
      setArchiveError(message)
      toast.error(message)
    } finally {
      setArchiving(false)
    }
  }

  function closeNewChat(): void {
    setNewChatOpen(false)
    setUsersError(null)
    setCreateChatError(null)
    setCreatingChat(false)
  }

  function openArchive(): void {
    setArchiveError(null)
    setArchiveOpen(true)
  }

  function closeArchive(): void {
    setArchiveOpen(false)
    setArchiveError(null)
  }

  return {
    currentUserId,
    tab,
    setTab,
    selectedId,
    setSelectedId,
    selected,
    showThread,
    searchInput,
    setSearchInput,
    conversations,
    chatsLoading,
    chatsLoadingMore,
    chatsError,
    chatsHasMore: chatsNextPage != null,
    loadChats,
    loadMoreChats: () => {
      if (chatsNextPage) void loadChats(chatsNextPage, true)
    },
    messages,
    messagesLoading,
    messagesLoadingOlder,
    messagesError,
    messagesHasMore: messagesNextPage != null,
    loadMessages,
    loadOlderMessages: () => {
      if (messagesNextPage && selectedId) {
        void loadMessages(selectedId, messagesNextPage, true)
      }
    },
    sending,
    sendError,
    clearSendError: () => setSendError(null),
    handleSend,
    totalUnread,
    newChatOpen,
    setNewChatOpen,
    availableUsers,
    userSearch,
    setUserSearch,
    usersLoading,
    usersError,
    createChatError,
    creatingChat,
    loadUsers,
    handleCreateChat,
    closeNewChat,
    archiveOpen,
    setArchiveOpen,
    archiving,
    archiveError,
    openArchive,
    closeArchive,
    handleArchiveConfirm,
  }
}
