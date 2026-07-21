/**
 * In-memory dummy GraphQL chat API + EventTarget subscriptions.
 * Same fetch signature as graphqlFetch so pages can swap endpoint + fetchImpl.
 */

import type {
  ChatMessage,
  Conversation,
  ChatUser,
  Unsubscribe,
} from '@/components/chat/types'

type StoredUser = ChatUser & { email: string }

type StoredChat = {
  id: string
  participantIds: [string, string]
  updatedAt: string
  archivedBy: Set<string>
  unread: Record<string, number>
}

type StoredMessage = ChatMessage

const bus = new EventTarget()

const users = new Map<string, StoredUser>()
const chats = new Map<string, StoredChat>()
const messages = new Map<string, StoredMessage[]>()
const sessions = new Map<string, string>() // token -> userId

let seeded = false

function delay(ms = 280) {
  return new Promise((r) => setTimeout(r, ms))
}

// Mock mode has no backend to persist an upload, and `blob:` URLs are filtered out by
// `mapApiMessage` (they don't survive a refresh) — a self-contained `data:` URL keeps the
// real dragged-in image visible for the rest of the offline demo session instead.
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function opName(query: string): string {
  const m = query.match(/\b(?:mutation|query|subscription)\s+(\w+)/)
  return m?.[1] ?? ''
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function nowIso() {
  return new Date().toISOString()
}

function seed() {
  if (seeded) return
  seeded = true

  const demo: StoredUser = {
    id: 'user_demo',
    fullName: 'Demo User',
    email: 'demo@example.com',
    imageUrl: null,
  }
  const alice: StoredUser = {
    id: 'user_alice',
    fullName: 'Alice Johnson',
    email: 'alice@example.com',
    imageUrl: null,
  }
  const bob: StoredUser = {
    id: 'user_bob',
    fullName: 'Bob Smith',
    email: 'bob@example.com',
    imageUrl: null,
  }
  for (const u of [demo, alice, bob]) users.set(u.id, u)

  const chat1: StoredChat = {
    id: 'chat_alice',
    participantIds: [demo.id, alice.id],
    updatedAt: nowIso(),
    archivedBy: new Set(),
    unread: { [demo.id]: 1, [alice.id]: 0 },
  }
  const chat2: StoredChat = {
    id: 'chat_bob',
    participantIds: [demo.id, bob.id],
    updatedAt: nowIso(),
    archivedBy: new Set(),
    unread: { [demo.id]: 0, [bob.id]: 0 },
  }
  chats.set(chat1.id, chat1)
  chats.set(chat2.id, chat2)

  messages.set(chat1.id, [
    {
      id: 'msg_1',
      content: 'Hey Demo! Welcome to the design-kit inbox.',
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
      messageType: 'TEXT',
      attachmentUrls: [],
      attachments: [],
      sender: alice,
      chatId: chat1.id,
    },
    {
      id: 'msg_2',
      content: 'Here is a sample image attachment.',
      createdAt: new Date(Date.now() - 1800_000).toISOString(),
      messageType: 'IMAGE',
      attachmentUrls: ['https://picsum.photos/seed/designkit/640/480'],
      attachments: [
        {
          id: 'att_1',
          url: 'https://picsum.photos/seed/designkit/640/480',
          fileName: 'sample.jpg',
          mimeType: 'image/jpeg',
        },
      ],
      sender: alice,
      chatId: chat1.id,
    },
  ])
  messages.set(chat2.id, [
    {
      id: 'msg_3',
      content: 'Hi Bob — testing the second conversation.',
      createdAt: new Date(Date.now() - 7200_000).toISOString(),
      messageType: 'TEXT',
      attachmentUrls: [],
      attachments: [],
      sender: demo,
      chatId: chat2.id,
    },
  ])
}

function resolveUserId(variables: Record<string, unknown>, headers?: HeadersInit): string {
  const token =
    String(variables._token ?? '') ||
    (typeof headers === 'object' && headers && 'Authorization' in (headers as object)
      ? String((headers as Record<string, string>).Authorization ?? '').replace(/^Bearer\s+/i, '')
      : '')
  if (token && sessions.has(token)) return sessions.get(token)!
  // Default demo identity for mock without auth session
  if (token.startsWith('tok_')) {
    // try match email from auth mock style tok_email_ts
    const email = token.slice(4).replace(/_\d+$/, '')
    for (const u of users.values()) {
      if (u.email === email) {
        sessions.set(token, u.id)
        return u.id
      }
    }
  }
  return 'user_demo'
}

function otherParticipant(chat: StoredChat, userId: string) {
  const otherId = chat.participantIds.find((id) => id !== userId)!
  return users.get(otherId)!
}

function toConversation(chat: StoredChat, userId: string): Conversation {
  const other = otherParticipant(chat, userId)
  const msgs = messages.get(chat.id) ?? []
  const last = msgs[msgs.length - 1]
  return {
    id: chat.id,
    name: other.fullName,
    email: other.email,
    avatar: other.imageUrl,
    lastMessage: last?.content || (last?.attachmentUrls?.length ? 'Photo' : ''),
    lastMessageType: last?.messageType,
    lastAttachmentUrls: last?.attachmentUrls ?? [],
    timestamp: last?.createdAt ?? chat.updatedAt,
    updatedAt: chat.updatedAt,
    unreadCount: chat.unread[userId] ?? 0,
    isActive: !chat.archivedBy.has(userId),
  }
}

function publish(kind: string, detail: unknown) {
  bus.dispatchEvent(new CustomEvent(kind, { detail }))
}

function paginateMeta(total: number, page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  return {
    dataCount: total,
    count: total,
    totalPages,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  }
}

export async function chatMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {},
  headers?: HeadersInit
): Promise<T> {
  seed()
  await delay()
  const name = opName(query)
  const userId = resolveUserId(variables, headers)
  const v = variables

  switch (name) {
    case 'AllChats': {
      const archived = Boolean(v.archived)
      const search = String(v.search ?? '')
        .trim()
        .toLowerCase()
      const page = Number(v.page ?? 1)
      const perPage = Number(v.perPage ?? 14)
      let list = [...chats.values()].filter((c) => {
        const isArchived = c.archivedBy.has(userId)
        if (archived !== isArchived) return false
        if (!c.participantIds.includes(userId)) return false
        if (!search) return true
        const other = otherParticipant(c, userId)
        return (
          other.fullName.toLowerCase().includes(search) ||
          other.email.toLowerCase().includes(search)
        )
      })
      list = list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      const slice = list.slice((page - 1) * perPage, page * perPage)
      return {
        allChats: {
          allData: slice.map((c) => {
            const conv = toConversation(c, userId)
            const other = otherParticipant(c, userId)
            return {
              id: c.id,
              isActive: !c.archivedBy.has(userId),
              updatedAt: c.updatedAt,
              unreadCount: conv.unreadCount,
              lastMessage: {
                id: (messages.get(c.id) ?? []).at(-1)?.id,
                content: conv.lastMessage,
                createdAt: conv.timestamp,
                messageType: conv.lastMessageType,
                attachmentUrls: conv.lastAttachmentUrls,
              },
              otherParticipant: {
                id: other.id,
                fullName: other.fullName,
                imageUrl: other.imageUrl,
                email: other.email,
              },
            }
          }),
          ...paginateMeta(list.length, page, perPage),
        },
      } as T
    }

    case 'AvailableUsersForChat': {
      const search = String(v.search ?? '')
        .trim()
        .toLowerCase()
      const page = Number(v.page ?? 1)
      const perPage = Number(v.perPage ?? 20)
      let list = [...users.values()].filter((u) => u.id !== userId)
      if (search) {
        list = list.filter(
          (u) =>
            u.fullName.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        )
      }
      const slice = list.slice((page - 1) * perPage, page * perPage)
      return {
        availableUsersForChat: {
          allData: slice.map((u) => ({
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            imageUrl: u.imageUrl,
          })),
          ...paginateMeta(list.length, page, perPage),
        },
      } as T
    }

    case 'FetchAllMessages': {
      const chatId = String(v.chatId)
      const page = Number(v.page ?? 1)
      const perPage = Number(v.perPage ?? 10)
      const all = [...(messages.get(chatId) ?? [])].reverse() // newest first
      const slice = all.slice((page - 1) * perPage, page * perPage)
      return {
        fetchAllMessages: {
          allData: slice,
          ...paginateMeta(all.length, page, perPage),
        },
      } as T
    }

    case 'CreateChat': {
      const participantId = String(
        (v.input as { participantId?: string } | undefined)?.participantId ??
          v.participantId ??
          ''
      )
      let existing = [...chats.values()].find(
        (c) =>
          c.participantIds.includes(userId) &&
          c.participantIds.includes(participantId)
      )
      if (!existing) {
        existing = {
          id: uid('chat'),
          participantIds: [userId, participantId],
          updatedAt: nowIso(),
          archivedBy: new Set(),
          unread: { [userId]: 0, [participantId]: 0 },
        }
        chats.set(existing.id, existing)
        messages.set(existing.id, [])
      }
      existing.archivedBy.delete(userId)
      const other = otherParticipant(existing, userId)
      const chat = {
        id: existing.id,
        updatedAt: existing.updatedAt,
        unreadCount: existing.unread[userId] ?? 0,
        otherParticipant: {
          id: other.id,
          fullName: other.fullName,
          imageUrl: other.imageUrl,
          email: other.email,
        },
      }
      publish('chatReordered', { userId, chat })
      return { createChat: { chat } } as T
    }

    case 'ArchiveChat': {
      const input = (v.input as { chatId: string; archive?: boolean }) ?? {
        chatId: String(v.chatId),
        archive: v.archive as boolean | undefined,
      }
      const chat = chats.get(input.chatId)
      if (chat) {
        if (input.archive !== false) chat.archivedBy.add(userId)
        else chat.archivedBy.delete(userId)
        publish('chatReordered', {
          userId,
          chat: {
            id: chat.id,
            updatedAt: chat.updatedAt,
            unreadCount: chat.unread[userId] ?? 0,
            otherParticipant: otherParticipant(chat, userId),
          },
        })
      }
      return { archiveChat: { success: true } } as T
    }

    case 'MarkChatAsRead': {
      const chatId = String(
        (v.input as { chatId?: string } | undefined)?.chatId ?? v.chatId
      )
      const chat = chats.get(chatId)
      if (chat) {
        chat.unread[userId] = 0
        publish('unreadChatCountUpdated', {
          userId,
          unreadChatCount: [...chats.values()].filter(
            (c) => (c.unread[userId] ?? 0) > 0 && !c.archivedBy.has(userId)
          ).length,
        })
        publish('chatReordered', {
          userId,
          chat: {
            id: chat.id,
            updatedAt: chat.updatedAt,
            unreadCount: 0,
            lastMessage: null,
            otherParticipant: otherParticipant(chat, userId),
          },
        })
      }
      return { markChatAsRead: { success: true } } as T
    }

    case 'SendMessage': {
      const input = (v.input as {
        chatId: string
        content: string
        messageType: 'TEXT' | 'IMAGE' | 'FILE'
        attachmentUrls?: string[]
        files?: File[]
      }) ?? {
        chatId: String(v.chatId),
        content: String(v.content ?? ''),
        messageType: (v.messageType as 'TEXT' | 'IMAGE' | 'FILE') ?? 'TEXT',
        attachmentUrls: v.attachmentUrls as string[] | undefined,
        files: v.files as File[] | undefined,
      }
      const chat = chats.get(input.chatId)
      if (!chat) throw new Error('Chat not found')
      const sender = users.get(userId)!
      const urls = input.files?.length
        ? await Promise.all(input.files.map(fileToDataUrl))
        : (input.attachmentUrls ?? [])
      const messageType = urls.length && input.messageType === 'TEXT' ? 'IMAGE' : input.messageType
      const msg: StoredMessage = {
        id: uid('msg'),
        content: input.content ?? '',
        createdAt: nowIso(),
        messageType,
        attachmentUrls: urls,
        attachments: urls.map((url, i) => ({
          id: uid('att'),
          url,
          fileName: `image-${i + 1}.jpg`,
          mimeType: 'image/jpeg',
        })),
        sender,
        chatId: input.chatId,
      }
      const list = messages.get(input.chatId) ?? []
      list.push(msg)
      messages.set(input.chatId, list)
      chat.updatedAt = msg.createdAt
      chat.archivedBy.clear()
      for (const pid of chat.participantIds) {
        if (pid !== userId) chat.unread[pid] = (chat.unread[pid] ?? 0) + 1
      }
      publish('messageAdded', { chatId: input.chatId, message: msg })
      for (const pid of chat.participantIds) {
        publish('chatReordered', {
          userId: pid,
          chat: {
            id: chat.id,
            updatedAt: chat.updatedAt,
            unreadCount: chat.unread[pid] ?? 0,
            lastMessage: {
              id: msg.id,
              content: msg.content,
              createdAt: msg.createdAt,
              messageType: msg.messageType,
              attachmentUrls: msg.attachmentUrls,
            },
            otherParticipant: otherParticipant(chat, pid),
          },
        })
        publish('unreadChatCountUpdated', {
          userId: pid,
          unreadChatCount: [...chats.values()].filter(
            (c) => (c.unread[pid] ?? 0) > 0 && !c.archivedBy.has(pid)
          ).length,
        })
      }
      return {
        sendMessage: {
          success: true,
          message: {
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            messageType: msg.messageType,
            attachmentUrls: msg.attachmentUrls,
            chatId: msg.chatId,
            sender: msg.sender,
          },
        },
      } as T
    }

    default:
      throw new Error(`Unknown chat mock operation: ${name || '(empty)'}`)
  }
}

export type MockSubscribeOptions = {
  kind: 'messageAdded' | 'chatReordered' | 'unreadChatCountUpdated'
  variables: Record<string, unknown>
  onData: (data: unknown) => void
}

export function chatMockSubscribe(options: MockSubscribeOptions): Unsubscribe {
  seed()
  const handler = (event: Event) => {
    const detail = (event as CustomEvent).detail as Record<string, unknown>
    if (options.kind === 'messageAdded') {
      if (detail.chatId !== options.variables.chatId) return
      options.onData({
        messageAdded: {
          ...(detail.message as object),
          attachments: ((detail.message as ChatMessage).attachmentUrls ?? []).join(',') || null,
        },
      })
    } else if (options.kind === 'chatReordered') {
      if (detail.userId !== options.variables.userId) return
      options.onData({ chatReordered: detail.chat })
    } else {
      if (detail.userId !== options.variables.userId) return
      options.onData({
        unreadChatCountUpdated: { unreadChatCount: detail.unreadChatCount },
      })
    }
  }
  bus.addEventListener(options.kind, handler)
  return () => bus.removeEventListener(options.kind, handler)
}
