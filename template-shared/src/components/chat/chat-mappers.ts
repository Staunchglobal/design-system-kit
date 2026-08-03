import type { ChatAttachment, ChatMessage, Conversation } from '@/components/chat/types'

/** Shape returned by `allChats` / `chatReordered`. */
export type ApiChatRow = {
  id: string
  /** Whether the chat is active (not archived) — `chatReordered` is a global per-user
   *  subscription, not scoped to a tab, so this is the only reliable signal for which
   *  list a reordered chat actually belongs in. */
  isActive?: boolean | null
  updatedAt: string
  unreadCount: number
  lastMessage?: {
    content?: string | null
    createdAt?: string | null
    messageType?: string | null
    attachmentUrls?: string[] | null
  } | null
  otherParticipant?: {
    id: string
    fullName: string
    imageUrl?: string | null
    email?: string | null
  } | null
}

export type ApiPagination = {
  page: number
  pages: number
  count: number
  perPage: number
}

export type AllChatsResult = {
  allChats: {
    chats: ApiChatRow[]
    pagination: ApiPagination
  }
}

/** Shape shared by `fetchAllMessages`, `sendMessage`, and `messageAdded` — all three
 *  resolve to the backend's `ChatMessageType`, which only ever exposes `sender`. */
export type ApiMessageRow = {
  id: string
  content: string
  createdAt: string
  messageType?: string | null
  attachmentUrls?: string[] | null
  attachments?: Array<{
    id?: string
    url: string
    fileName?: string
    mimeType?: string
    sizeBytes?: number
  }> | null
  sender: {
    id: string
    fullName: string
    imageUrl?: string | null
    email?: string | null
  }
  chatId?: string | null
}

function toMessageType(value: string | null | undefined): ChatMessage['messageType'] {
  if (value === 'IMAGE' || value === 'VIDEO' || value === 'ANNOUNCEMENT' || value === 'TEXT') {
    return value
  }
  return 'TEXT'
}

export function mapConversation(row: ApiChatRow): Conversation {
  return {
    id: row.id,
    name: row.otherParticipant?.fullName ?? 'Unknown',
    email: row.otherParticipant?.email,
    avatar: row.otherParticipant?.imageUrl,
    lastMessage: row.lastMessage?.content ?? '',
    lastMessageType: row.lastMessage?.messageType,
    lastAttachmentUrls: row.lastMessage?.attachmentUrls ?? [],
    timestamp: row.lastMessage?.createdAt ?? row.updatedAt,
    updatedAt: row.updatedAt,
    unreadCount: row.unreadCount ?? 0,
    // Default true (not archived) when the field is genuinely absent from a response
    // that never queried it — every call site that cares (chatReordered) always queries it.
    isActive: row.isActive ?? true,
  }
}

export function mapApiMessage(m: ApiMessageRow): ChatMessage {
  const rawUrls = Array.isArray(m.attachmentUrls) ? m.attachmentUrls : []
  const attachmentUrls = [...new Set(rawUrls.filter((u) => u && !u.startsWith('blob:')))]

  const attachments: ChatAttachment[] = (
    Array.isArray(m.attachments) ? m.attachments : attachmentUrls.map((url) => ({ url }))
  ).filter((a) => a?.url && !a.url.startsWith('blob:'))

  return {
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    messageType: toMessageType(m.messageType),
    attachmentUrls,
    attachments,
    sender: {
      id: m.sender.id,
      fullName: m.sender.fullName,
      imageUrl: m.sender.imageUrl,
      email: m.sender.email,
    },
    chatId: m.chatId,
  }
}
